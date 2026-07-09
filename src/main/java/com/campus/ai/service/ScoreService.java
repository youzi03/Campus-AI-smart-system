package com.campus.ai.service;

import com.campus.ai.common.BusinessException;
import com.campus.ai.common.ResourceNotFoundException;
import com.campus.ai.entity.Score;
import com.campus.ai.repository.ScoreRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScoreService {

    private final ScoreRepository scoreRepository;

    public List<Score> getScores() { return scoreRepository.findAll(); }
    public List<Score> searchScores(String studentId, String courseId, String semester) {
        return scoreRepository.search(blankToNull(studentId), blankToNull(courseId), blankToNull(semester));
    }
    public Score getScore(String id) {
        return scoreRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("成绩不存在: " + id));
    }

    @Transactional
    public Score addScore(Score s) {
        if (scoreRepository.existsByStudentIdAndCourseIdAndSemester(s.getStudentId(), s.getCourseId(), s.getSemester())) {
            throw new BusinessException("该学生该课程的成绩已存在");
        }
        if (s.getScore() != null && (s.getScore() < 0 || s.getScore() > 100)) {
            throw new BusinessException("成绩必须在 0-100 之间");
        }
        return scoreRepository.save(s);
    }

    @Transactional
    public Score updateScore(String id, Score s) {
        Score exist = getScore(id);
        if (s.getStudentId() != null) exist.setStudentId(s.getStudentId());
        if (s.getStudentName() != null) exist.setStudentName(s.getStudentName());
        if (s.getCourseId() != null) exist.setCourseId(s.getCourseId());
        if (s.getCourseName() != null) exist.setCourseName(s.getCourseName());
        if (s.getScore() != null) {
            if (s.getScore() < 0 || s.getScore() > 100) throw new BusinessException("成绩必须在 0-100 之间");
            exist.setScore(s.getScore());
        }
        if (s.getSemester() != null) exist.setSemester(s.getSemester());
        if (s.getType() != null) exist.setType(s.getType());
        if (s.getInputAt() != null) exist.setInputAt(s.getInputAt());
        return scoreRepository.save(exist);
    }

    @Transactional
    public void deleteScore(String id) { getScore(id); scoreRepository.deleteById(id); }

    /** 按课程统计 */
    public List<Map<String, Object>> statByCourse() {
        var all = scoreRepository.findAll();
        var map = new LinkedHashMap<String, Map<String, Object>>();
        for (var s : all) {
            var row = map.computeIfAbsent(s.getCourseId(), k -> {
                var m = new HashMap<String, Object>();
                m.put("courseId", s.getCourseId());
                m.put("courseName", s.getCourseName());
                m.put("count", 0); m.put("total", 0.0);
                m.put("max", 0.0); m.put("min", 100.0);
                m.put("pass", 0); m.put("fail", 0);
                return m;
            });
            Double sc = s.getScore();
            if (sc == null) continue;
            row.put("count", (Integer)row.get("count") + 1);
            row.put("total", (Double)row.get("total") + sc);
            row.put("max", Math.max((Double)row.get("max"), sc));
            row.put("min", Math.min((Double)row.get("min"), sc));
            if (sc >= 60) row.put("pass", (Integer)row.get("pass") + 1);
            else row.put("fail", (Integer)row.get("fail") + 1);
        }
        var result = new ArrayList<Map<String, Object>>();
        for (var e : map.entrySet()) {
            var r = e.getValue();
            int count = (Integer)r.get("count");
            double total = (Double)r.get("total");
            r.put("avg", String.format("%.1f", total / count));
            r.remove("total");
            result.add(r);
        }
        return result;
    }

    /** 成绩预警（<60 分） */
    public List<Score> getWarnings() { return scoreRepository.findWarnings(); }

    public long scoreCount() { return scoreRepository.count(); }

    private String blankToNull(String s) { return (s == null || s.trim().isEmpty()) ? null : s.trim(); }
}
