package com.campus.ai.controller;

import com.campus.ai.common.ApiResult;
import com.campus.ai.common.PageResult;
import com.campus.ai.entity.Student;
import com.campus.ai.entity.Teacher;
import com.campus.ai.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ==================== 学生接口 ====================

    @GetMapping("/students")
    public ApiResult<PageResult<Student>> listStudents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String college,
            @RequestParam(required = false) String grade,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "1000") int size) {
        List<Student> list = userService.searchStudents(keyword, college, grade, status);
        return ApiResult.success(PageResult.slice(list, page, size));
    }

    @GetMapping("/students/all")
    public ApiResult<List<Student>> allStudents() {
        return ApiResult.success(userService.getStudents());
    }

    @GetMapping("/students/{id}")
    public ApiResult<Student> getStudent(@PathVariable String id) {
        return ApiResult.success(userService.getStudent(id));
    }

    @PostMapping("/students")
    public ApiResult<Student> addStudent(@RequestBody Student student) {
        return ApiResult.success(userService.addStudent(student));
    }

    @PutMapping("/students/{id}")
    public ApiResult<Student> updateStudent(@PathVariable String id, @RequestBody Student student) {
        return ApiResult.success(userService.updateStudent(id, student, null));
    }

    @DeleteMapping("/students/{id}")
    public ApiResult<Void> deleteStudent(@PathVariable String id) {
        userService.deleteStudent(id);
        return ApiResult.success();
    }

    /** 变更学籍状态 */
    @PutMapping("/students/{id}/status")
    public ApiResult<Student> changeStudentStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ApiResult.error(400, "状态不能为空");
        }
        return ApiResult.success(userService.changeStudentStatus(id, newStatus));
    }

    /** 批量变更学籍状态 */
    @PostMapping("/students/batch-status")
    public ApiResult<Map<String, Object>> batchChangeStudentStatus(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<String> ids = (List<String>) body.get("ids");
        String status = (String) body.get("status");
        if (ids == null || ids.isEmpty() || status == null) {
            return ApiResult.error(400, "参数错误：ids 和 status 不能为空");
        }
        int count = userService.batchChangeStudentStatus(ids, status);
        return ApiResult.success(Map.of("changed", count));
    }

    /** 批量录入学生 */
    @PostMapping("/students/batch")
    public ApiResult<Map<String, Object>> batchAddStudents(@RequestBody List<Student> students) {
        return ApiResult.success(userService.batchAddStudents(students));
    }

    // ==================== 教师接口 ====================

    @GetMapping("/teachers")
    public ApiResult<PageResult<Teacher>> listTeachers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String college,
            @RequestParam(required = false) String title,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "1000") int size) {
        List<Teacher> list = userService.searchTeachers(keyword, college, title);
        return ApiResult.success(PageResult.slice(list, page, size));
    }

    @GetMapping("/teachers/all")
    public ApiResult<List<Teacher>> allTeachers() {
        return ApiResult.success(userService.getTeachers());
    }

    @GetMapping("/teachers/{id}")
    public ApiResult<Teacher> getTeacher(@PathVariable String id) {
        return ApiResult.success(userService.getTeacher(id));
    }

    @PostMapping("/teachers")
    public ApiResult<Teacher> addTeacher(@RequestBody Teacher teacher) {
        return ApiResult.success(userService.addTeacher(teacher));
    }

    @PutMapping("/teachers/{id}")
    public ApiResult<Teacher> updateTeacher(@PathVariable String id, @RequestBody Teacher teacher) {
        return ApiResult.success(userService.updateTeacher(id, teacher));
    }

    @DeleteMapping("/teachers/{id}")
    public ApiResult<Void> deleteTeacher(@PathVariable String id) {
        userService.deleteTeacher(id);
        return ApiResult.success();
    }

    /** 批量录入教师 */
    @PostMapping("/teachers/batch")
    public ApiResult<Map<String, Object>> batchAddTeachers(@RequestBody List<Teacher> teachers) {
        return ApiResult.success(userService.batchAddTeachers(teachers));
    }

    // ==================== 操作日志接口 ====================

    @GetMapping("/op-logs")
    public ApiResult<PageResult<com.campus.ai.entity.OpLog>> listOpLogs(
            @RequestParam(required = false) String target,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int size) {
        List<com.campus.ai.entity.OpLog> list = userService.getOpLogs(target, type, keyword);
        return ApiResult.success(PageResult.slice(list, page, size));
    }

    @DeleteMapping("/op-logs")
    public ApiResult<Void> clearOpLogs() {
        userService.clearOpLogs();
        return ApiResult.success();
    }

    // ==================== 统计接口 ====================

    @GetMapping("/stats")
    public ApiResult<Map<String, Object>> stats() {
        return ApiResult.success(Map.of(
            "studentCount", userService.studentCount(),
            "activeStudentCount", userService.activeStudentCount(),
            "teacherCount", userService.teacherCount()
        ));
    }
}
