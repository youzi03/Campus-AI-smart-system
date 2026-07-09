package com.campus.ai.ai.service;

import com.campus.ai.ai.dto.AnalyzeRequest;
import com.campus.ai.ai.dto.AnalyzeResponse;
import com.campus.ai.ai.dto.DataSnapshot;
import com.campus.ai.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AI 分析服务 — 收集数据、构造 Prompt、调用 DeepSeek 分析并返回结果
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final DeepSeekClient deepSeekClient;

    // 注入各 Repository 获取数据
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final CourseRepository courseRepository;
    private final ScoreRepository scoreRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final DormRoomRepository dormRoomRepository;
    private final DormAllocationRepository dormAllocationRepository;
    private final NoticeRepository noticeRepository;
    private final BookRepository bookRepository;

    /**
     * 执行 AI 分析（入口方法）
     */
    public AnalyzeResponse analyze(AnalyzeRequest request) {
        String type = request.getType() != null ? request.getType() : "custom_query";

        // 1. 采集数据快照
        DataSnapshot snapshot = collectDataSnapshot();

        // 2. 根据分析类型构造 Prompt
        String systemPrompt = buildSystemPrompt(type);
        String userPrompt = buildUserPrompt(type, request, snapshot);

        // 3. 调用 DeepSeek 并处理异常
        log.info("AI 分析开始, type={}", type);
        try {
            String analysisText = deepSeekClient.chat(systemPrompt, userPrompt);

            // 4. 提取建议列表（从分析文本中解析）
            List<String> suggestions = extractSuggestions(analysisText);

            return AnalyzeResponse.ok(analysisText, suggestions, snapshot, type);
        } catch (Exception e) {
            log.error("AI 分析调用失败, type={}", type, e);
            return AnalyzeResponse.fail("AI 分析服务调用失败: " + e.getMessage());
        }
    }

    // ==================== 数据采集 ====================

    /**
     * 采集系统数据快照
     */
    private DataSnapshot collectDataSnapshot() {
        var snap = new DataSnapshot();

        snap.setStudentCount(studentRepository.countActive());
        snap.setTeacherCount(teacherRepository.count());
        snap.setCourseCount(courseRepository.count());
        snap.setScoreCount(scoreRepository.count());

        // 不及格统计
        try {
            var warnings = scoreRepository.findWarnings();
            snap.setFailCount(warnings.size());
        } catch (Exception e) {
            log.warn("统计不及格人数失败", e);
        }

        // 平均分
        try {
            var allScores = scoreRepository.findAll();
            var avg = allScores.stream()
                .filter(s -> s.getScore() != null)
                .mapToDouble(s -> s.getScore())
                .average().orElse(0);
            snap.setAverageScore(String.format("%.1f", avg));
        } catch (Exception e) {
            snap.setAverageScore("N/A");
        }

        // 借阅统计
        try {
            var borrows = borrowRecordRepository.findAll();
            snap.setBorrowCount(borrows.size());
            snap.setOverdueCount(borrows.stream()
                .filter(b -> "逾期".equals(b.getStatus()) || "overdue".equalsIgnoreCase(b.getStatus() != null ? b.getStatus() : ""))
                .count());
        } catch (Exception e) {
            log.warn("统计借阅数据失败", e);
        }

        // 宿舍入住率
        try {
            long totalBeds = dormRoomRepository.findAll().stream()
                .mapToLong(r -> r.getCapacity() != null ? r.getCapacity() : 0)
                .sum();
            long allocated = dormAllocationRepository.count();
            snap.setDormOccupancy(totalBeds > 0 ? String.format("%.1f%%", allocated * 100.0 / totalBeds) : "N/A");
        } catch (Exception e) {
            snap.setDormOccupancy("N/A");
        }

        // 近期公告
        try {
            var notices = noticeRepository.findAll();
            var oneMonthAgo = java.time.LocalDate.now().minusDays(30);
            snap.setRecentNoticeCount(notices.stream()
                .filter(n -> {
                    try {
                        // 使用 DateTimeFormatter 兼容多种日期格式
                        var fmt = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd");
                        var date = java.time.LocalDate.parse(n.getCreateAt(), fmt);
                        return date.isAfter(oneMonthAgo);
                    } catch (Exception e) {
                        return false;
                    }
                })
                .count());
        } catch (Exception e) {
            log.warn("统计公告失败", e);
        }

        return snap;
    }

    /**
     * 获取详细的成绩分析数据（用于 AI Prompt）
     */
    private String buildScoreDetail() {
        try {
            var allScores = scoreRepository.findAll();
            if (allScores.isEmpty()) return "暂无成绩数据。";

            var courseStats = new LinkedHashMap<String, Map<String, Object>>();
            for (var s : allScores) {
                if (s.getScore() == null) continue;
                var row = courseStats.computeIfAbsent(s.getCourseId(), k -> {
                    var m = new HashMap<String, Object>();
                    m.put("courseName", s.getCourseName());
                    m.put("count", 0); m.put("total", 0.0);
                    m.put("max", 0.0); m.put("min", 100.0);
                    m.put("pass", 0); m.put("fail", 0);
                    return m;
                });
                double sc = s.getScore();
                row.put("count", (Integer) row.get("count") + 1);
                row.put("total", (Double) row.get("total") + sc);
                row.put("max", Math.max((Double) row.get("max"), sc));
                row.put("min", Math.min((Double) row.get("min"), sc));
                if (sc >= 60) row.put("pass", (Integer) row.get("pass") + 1);
                else row.put("fail", (Integer) row.get("fail") + 1);
            }

            var sb = new StringBuilder("=== 各课程成绩统计 ===\n");
            for (var e : courseStats.entrySet()) {
                var r = e.getValue();
                int count = (Integer) r.get("count");
                double total = (Double) r.get("total");
                double avg = total / count;
                int pass = (Integer) r.get("pass");
                int fail = (Integer) r.get("fail");
                sb.append(String.format("课程[%s]: 参考%d人, 均分%.1f, 最高%.1f, 最低%.1f, 及格%d人(%.1f%%), 不及格%d人(%.1f%%)\n",
                    r.get("courseName"), count, avg, r.get("max"), r.get("min"),
                    pass, pass * 100.0 / count, fail, fail * 100.0 / count));
            }
            return sb.toString();
        } catch (Exception e) {
            return "采集成绩数据失败: " + e.getMessage();
        }
    }

    /**
     * 获取详细的借阅数据（用于 AI Prompt）
     */
    private String buildBorrowDetail() {
        try {
            var borrows = borrowRecordRepository.findAll();
            var books = bookRepository.findAll();
            if (borrows.isEmpty()) return "暂无借阅数据。";
            return String.format("总借阅记录: %d条, 逾期: %d条, 书籍总量: %d本",
                borrows.size(),
                borrows.stream().filter(b -> "逾期".equals(b.getStatus()) || "overdue".equalsIgnoreCase(b.getStatus() != null ? b.getStatus() : "")).count(),
                books.size());
        } catch (Exception e) {
            return "采集借阅数据失败: " + e.getMessage();
        }
    }

    // ==================== Prompt 构造 ====================

    private String buildSystemPrompt(String type) {
        return switch (type) {
            case "score_analysis" -> """
                你是校园信息管理系统的 AI 数据分析师。你擅长分析成绩数据，发现教学中的问题和亮点。
                请根据提供的成绩数据，用中文给出专业、详实的分析报告，包括：
                1. 总体情况概述
                2. 各课程成绩对比分析
                3. 突出问题与风险点
                4. 改进建议

                请用 Markdown 格式输出，语言要通俗易懂，数据要准确引用。
                """;
            case "student_profile" -> """
                你是校园信息管理系统的 AI 学情分析师。你擅长综合分析学生的成绩、借阅、住宿等多维度数据，生成学生画像。
                请根据提供的学生数据和问题，用中文生成分析。

                请用 Markdown 格式输出，包含该生的综合表现评价、优劣势分析和建议。
                """;
            case "teaching_evaluation" -> """
                你是校园信息管理系统的 AI 教学评估专家。你擅长通过成绩分布和课程数据评估教学质量。
                请根据提供的教学数据，用中文生成分析报告，包括：
                1. 教学整体成效
                2. 各课程教学效果对比
                3. 需要关注的教学薄弱环节
                4. 针对性改进建议

                请用 Markdown 格式输出。
                """;
            case "borrow_analysis" -> """
                你是校园图书馆的 AI 数据分析师。你擅长分析图书借阅数据，发现阅读趋势和管理优化点。
                请根据提供的借阅数据，用中文生成分析报告，包括：
                1. 借阅总体情况
                2. 热门书籍分析
                3. 逾期情况分析
                4. 图书资源优化建议

                请用 Markdown 格式输出。
                """;
            case "dorm_analysis" -> """
                你是校园宿舍管理的 AI 分析师。你擅长分析宿舍入住和分配数据。
                请根据提供的宿舍数据，用中文生成分析报告。

                请用 Markdown 格式输出。
                """;
            default -> """
                你是校园信息管理系统的 AI 智能助手。你擅长根据校园数据回答用户的问题。
                请根据提供的校园数据，用中文准确、专业地回答问题。
                如果数据不足以回答，请如实告知，并建议用户提供更多信息。

                请用 Markdown 格式输出。
                """;
        };
    }

    private String buildUserPrompt(String type, AnalyzeRequest request, DataSnapshot snapshot) {
        var sb = new StringBuilder();

        // 添加上下文数据
        sb.append("## 当前系统数据概览\n\n");
        sb.append(String.format("- 学生总数: %d\n", snapshot.getStudentCount()));
        sb.append(String.format("- 教师总数: %d\n", snapshot.getTeacherCount()));
        sb.append(String.format("- 课程总数: %d\n", snapshot.getCourseCount()));
        sb.append(String.format("- 成绩记录: %d条\n", snapshot.getScoreCount()));
        sb.append(String.format("- 不及格成绩: %d条\n", snapshot.getFailCount()));
        sb.append(String.format("- 全校平均分: %s\n", snapshot.getAverageScore()));
        sb.append(String.format("- 借阅记录: %d条\n", snapshot.getBorrowCount()));
        sb.append(String.format("- 逾期记录: %d条\n", snapshot.getOverdueCount()));
        sb.append(String.format("- 宿舍入住率: %s\n", snapshot.getDormOccupancy()));
        sb.append(String.format("- 近30天公告: %d条\n\n", snapshot.getRecentNoticeCount()));

        // 根据类型添加详细数据
        switch (type) {
            case "score_analysis", "teaching_evaluation" -> sb.append(buildScoreDetail());
            case "borrow_analysis" -> sb.append(buildBorrowDetail());
        }

        // 添加用户具体参数
        if (request.getParams() != null && !request.getParams().isEmpty()) {
            sb.append("\n## 查询参数\n\n");
            request.getParams().forEach((k, v) -> sb.append(String.format("- %s: %s\n", k, v)));
            sb.append("\n");
        }

        // 添加用户自定义问题
        if (request.getQuery() != null && !request.getQuery().isBlank()) {
            sb.append("\n## 用户的具体问题\n\n");
            sb.append(request.getQuery());
            sb.append("\n");
        } else {
            // 默认问题
            sb.append("\n## 分析要求\n\n");
            sb.append("请基于以上数据进行全面分析，给出专业、有洞察的分析报告。");
        }

        return sb.toString();
    }

    // ==================== 辅助方法 ====================

    /**
     * 从 AI 回复文本中提取建议列表（匹配以 - 或 * 开头的行）
     */
    private List<String> extractSuggestions(String text) {
        if (text == null || text.isBlank()) return List.of();
        return Arrays.stream(text.split("\n"))
            .filter(line -> line.trim().matches("^[-*]\\s+.+"))
            .map(String::trim)
            .collect(Collectors.toList());
    }

    /**
     * 获取系统数据总览（供前端首页或看板使用）
     */
    public DataSnapshot getDataSnapshot() {
        return collectDataSnapshot();
    }
}
