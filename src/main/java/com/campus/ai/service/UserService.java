package com.campus.ai.service;

import com.campus.ai.common.BusinessException;
import com.campus.ai.common.ResourceNotFoundException;
import com.campus.ai.common.UserContext;
import com.campus.ai.entity.OpLog;
import com.campus.ai.entity.Student;
import com.campus.ai.entity.Teacher;
import com.campus.ai.repository.OpLogRepository;
import com.campus.ai.repository.StudentRepository;
import com.campus.ai.repository.TeacherRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final OpLogRepository opLogRepository;
    private final AuthService authService;

    // ==================== 操作日志 ====================

    public void addOpLog(String type, String target, String targetId, String detail) {
        OpLog log = new OpLog();
        log.setType(type);
        log.setTarget(target);
        log.setTargetId(targetId);
        log.setOperator(UserContext.getCurrentUser());
        log.setDetail(detail);
        log.setTime(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        opLogRepository.save(log);
    }

    public List<OpLog> getOpLogs(String target, String type, String keyword) {
        if (target == null && type == null && keyword == null) {
            return opLogRepository.findAll();
        }
        return opLogRepository.search(target, type, keyword);
    }

    @Transactional
    public void clearOpLogs() {
        opLogRepository.deleteAll();
    }

    // ==================== 学生管理 ====================

    public List<Student> getStudents() {
        return studentRepository.findAll();
    }

    public List<Student> searchStudents(String keyword, String college, String grade, String status) {
        return studentRepository.search(
            blankToNull(keyword),
            blankToNull(college),
            blankToNull(grade),
            blankToNull(status)
        );
    }

    public Student getStudent(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("学生不存在: " + id));
    }

    @Transactional
    public Student addStudent(Student s) {
        if (studentRepository.existsById(s.getId())) {
            throw new BusinessException("学号已存在：" + s.getId());
        }
        if (s.getStatus() == null) s.setStatus("在读");
        Student saved = studentRepository.save(s);

        // 同步创建登录账号（默认密码=学号）
        try {
            authService.createAccount(s.getId(), s.getId(), "student", s.getName(), s.getPhone());
        } catch (Exception e) {
            log.warn("创建学生账号失败（不影响学生信息保存）: {}", e.getMessage());
        }

        addOpLog("新增", "学生", s.getId(), "新增学生：" + s.getName() + "（" + s.getCollege() + " " + s.getMajor() + "）");
        log.info("新增学生: {} {}", s.getId(), s.getName());
        return saved;
    }

    @Transactional
    public Student updateStudent(String id, Student s, Map<String, Object> oldData) {
        Student existing = getStudent(id);
        if (s.getName() != null) existing.setName(s.getName());
        if (s.getGender() != null) existing.setGender(s.getGender());
        if (s.getBirth() != null) existing.setBirth(s.getBirth());
        if (s.getCollege() != null) existing.setCollege(s.getCollege());
        if (s.getMajor() != null) existing.setMajor(s.getMajor());
        if (s.getGrade() != null) existing.setGrade(s.getGrade());
        if (s.getPhone() != null) existing.setPhone(s.getPhone());
        if (s.getDorm() != null) existing.setDorm(s.getDorm());
        if (s.getStatus() != null) existing.setStatus(s.getStatus());
        Student saved = studentRepository.save(existing);
        addOpLog("编辑", "学生", id, "编辑学生：" + saved.getName());
        log.info("更新学生: {} {}", id, saved.getName());
        return saved;
    }

    @Transactional
    public void deleteStudent(String id) {
        Student s = getStudent(id);
        addOpLog("删除", "学生", id, "删除学生：" + s.getName() + "（学号：" + id + "）");
        studentRepository.deleteById(id);
        log.info("删除学生: {} {}", id, s.getName());
    }

    /** 变更单个学生学籍状态 */
    @Transactional
    public Student changeStudentStatus(String id, String newStatus) {
        Student s = getStudent(id);
        String oldStatus = s.getStatus();
        s.setStatus(newStatus);
        s.setStatusChangeAt(LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        s.setStatusOperator(UserContext.getCurrentUser());
        Student saved = studentRepository.save(s);
        addOpLog("状态变更", "学生", id, s.getName() + "：" + oldStatus + " → " + newStatus);
        log.info("学生状态变更: {} {} → {}", id, oldStatus, newStatus);
        return saved;
    }

    /** 批量变更学籍状态 */
    @Transactional
    public int batchChangeStudentStatus(List<String> ids, String newStatus) {
        int count = 0;
        for (String id : ids) {
            try {
                changeStudentStatus(id, newStatus);
                count++;
            } catch (Exception e) {
                log.warn("批量状态变更跳过: {} - {}", id, e.getMessage());
            }
        }
        if (count > 0) {
            addOpLog("批量状态变更", "学生", String.join(",", ids),
                    "批量变更 " + count + " 名学生状态为：" + newStatus);
        }
        return count;
    }

    /** 批量录入学生 */
    @Transactional
    public Map<String, Object> batchAddStudents(List<Student> rows) {
        int added = 0, skipped = 0;
        for (Student r : rows) {
            try {
                addStudent(r);
                added++;
            } catch (BusinessException e) {
                skipped++;
                log.warn("批量录入跳过: {} - {}", r.getId(), e.getMessage());
            }
        }
        if (added > 0) {
            addOpLog("批量新增", "学生", "batch", "批量录入新增 " + added + " 名学生");
        }
        return Map.of("added", added, "skipped", skipped, "total", rows.size());
    }

    // ==================== 教师管理 ====================

    public List<Teacher> getTeachers() {
        return teacherRepository.findAll();
    }

    public List<Teacher> searchTeachers(String keyword, String college, String title) {
        return teacherRepository.search(
            blankToNull(keyword),
            blankToNull(college),
            blankToNull(title)
        );
    }

    public Teacher getTeacher(String id) {
        return teacherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("教师不存在: " + id));
    }

    @Transactional
    public Teacher addTeacher(Teacher t) {
        if (teacherRepository.existsById(t.getId())) {
            throw new BusinessException("工号已存在：" + t.getId());
        }
        Teacher saved = teacherRepository.save(t);

        // 同步创建登录账号（默认密码=工号）
        try {
            authService.createAccount(t.getId(), t.getId(), "teacher", t.getName(), t.getPhone());
        } catch (Exception e) {
            log.warn("创建教师账号失败（不影响教师信息保存）: {}", e.getMessage());
        }

        addOpLog("新增", "教师", t.getId(), "新增教师：" + t.getName() + "（" + t.getCollege() + " " + t.getTitle() + "）");
        log.info("新增教师: {} {}", t.getId(), t.getName());
        return saved;
    }

    @Transactional
    public Teacher updateTeacher(String id, Teacher t) {
        Teacher existing = getTeacher(id);
        if (t.getName() != null) existing.setName(t.getName());
        if (t.getGender() != null) existing.setGender(t.getGender());
        if (t.getCollege() != null) existing.setCollege(t.getCollege());
        if (t.getTitle() != null) existing.setTitle(t.getTitle());
        if (t.getMajor() != null) existing.setMajor(t.getMajor());
        if (t.getPhone() != null) existing.setPhone(t.getPhone());
        if (t.getEmail() != null) existing.setEmail(t.getEmail());
        if (t.getJoinYear() != null) existing.setJoinYear(t.getJoinYear());
        Teacher saved = teacherRepository.save(existing);
        addOpLog("编辑", "教师", id, "编辑教师：" + saved.getName());
        log.info("更新教师: {} {}", id, saved.getName());
        return saved;
    }

    @Transactional
    public void deleteTeacher(String id) {
        Teacher t = getTeacher(id);
        addOpLog("删除", "教师", id, "删除教师：" + t.getName() + "（工号：" + id + "）");
        teacherRepository.deleteById(id);
        log.info("删除教师: {} {}", id, t.getName());
    }

    /** 批量录入教师 */
    @Transactional
    public Map<String, Object> batchAddTeachers(List<Teacher> rows) {
        int added = 0, skipped = 0;
        for (Teacher r : rows) {
            try {
                addTeacher(r);
                added++;
            } catch (BusinessException e) {
                skipped++;
                log.warn("批量录入跳过: {} - {}", r.getId(), e.getMessage());
            }
        }
        if (added > 0) {
            addOpLog("批量新增", "教师", "batch", "批量录入新增 " + added + " 名教师");
        }
        return Map.of("added", added, "skipped", skipped, "total", rows.size());
    }

    // ==================== 统计数据 ====================

    public long studentCount() { return studentRepository.countActive(); }
    public long activeStudentCount() { return studentRepository.countByStatus("在读"); }
    public long teacherCount() { return teacherRepository.count(); }

    // ==================== 工具方法 ====================

    private String blankToNull(String s) {
        return (s == null || s.trim().isEmpty()) ? null : s.trim();
    }
}
