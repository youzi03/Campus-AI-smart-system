package com.campus.ai.controller;

import com.campus.ai.common.ApiResult;
import com.campus.ai.common.PageResult;
import com.campus.ai.entity.*;
import com.campus.ai.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    // ===== 课程 =====
    @GetMapping("/courses")
    public ApiResult<PageResult<Course>> listCourses(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String college,
            @RequestParam(required = false) String semester,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "1000") int size) {
        return ApiResult.success(PageResult.slice(courseService.searchCourses(keyword, college, semester), page, size));
    }
    @GetMapping("/courses/all")
    public ApiResult<List<Course>> allCourses() { return ApiResult.success(courseService.getCourses()); }
    @GetMapping("/courses/{id}")
    public ApiResult<Course> getCourse(@PathVariable String id) { return ApiResult.success(courseService.getCourse(id)); }
    @PostMapping("/courses")
    public ApiResult<Course> addCourse(@RequestBody Course c) { return ApiResult.success(courseService.addCourse(c)); }
    @PutMapping("/courses/{id}")
    public ApiResult<Course> updateCourse(@PathVariable String id, @RequestBody Course c) { return ApiResult.success(courseService.updateCourse(id, c)); }
    @DeleteMapping("/courses/{id}")
    public ApiResult<Void> deleteCourse(@PathVariable String id) { courseService.deleteCourse(id); return ApiResult.success(); }

    // ===== 教室 =====
    @GetMapping("/classrooms")
    public ApiResult<PageResult<Classroom>> listClassrooms(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "1000") int size) {
        return ApiResult.success(PageResult.slice(courseService.searchClassrooms(keyword, type, status), page, size));
    }
    @GetMapping("/classrooms/all")
    public ApiResult<List<Classroom>> allClassrooms() { return ApiResult.success(courseService.getClassrooms()); }
    @GetMapping("/classrooms/{id}")
    public ApiResult<Classroom> getClassroom(@PathVariable String id) { return ApiResult.success(courseService.getClassroom(id)); }
    @PostMapping("/classrooms")
    public ApiResult<Classroom> addClassroom(@RequestBody Classroom r) { return ApiResult.success(courseService.addClassroom(r)); }
    @PutMapping("/classrooms/{id}")
    public ApiResult<Classroom> updateClassroom(@PathVariable String id, @RequestBody Classroom r) { return ApiResult.success(courseService.updateClassroom(id, r)); }
    @DeleteMapping("/classrooms/{id}")
    public ApiResult<Void> deleteClassroom(@PathVariable String id) { courseService.deleteClassroom(id); return ApiResult.success(); }

    // ===== 实验室 =====
    @GetMapping("/labs")
    public ApiResult<PageResult<Lab>> listLabs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "1000") int size) {
        return ApiResult.success(PageResult.slice(courseService.searchLabs(keyword, type, status), page, size));
    }
    @GetMapping("/labs/all")
    public ApiResult<List<Lab>> allLabs() { return ApiResult.success(courseService.getLabs()); }
    @GetMapping("/labs/{id}")
    public ApiResult<Lab> getLab(@PathVariable String id) { return ApiResult.success(courseService.getLab(id)); }
    @PostMapping("/labs")
    public ApiResult<Lab> addLab(@RequestBody Lab l) { return ApiResult.success(courseService.addLab(l)); }
    @PutMapping("/labs/{id}")
    public ApiResult<Lab> updateLab(@PathVariable String id, @RequestBody Lab l) { return ApiResult.success(courseService.updateLab(id, l)); }
    @DeleteMapping("/labs/{id}")
    public ApiResult<Void> deleteLab(@PathVariable String id) { courseService.deleteLab(id); return ApiResult.success(); }

    // ===== 课表 =====
    @GetMapping("/schedules")
    public ApiResult<PageResult<Schedule>> listSchedules(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String courseId,
            @RequestParam(required = false) String classGroup,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "1000") int size) {
        return ApiResult.success(PageResult.slice(courseService.searchSchedules(teacherId, courseId, classGroup), page, size));
    }
    @GetMapping("/schedules/all")
    public ApiResult<List<Schedule>> allSchedules() { return ApiResult.success(courseService.getSchedules()); }
    @GetMapping("/schedules/{id}")
    public ApiResult<Schedule> getSchedule(@PathVariable String id) { return ApiResult.success(courseService.getSchedule(id)); }
    @PostMapping("/schedules")
    public ApiResult<Schedule> addSchedule(@RequestBody Schedule s) { return ApiResult.success(courseService.addSchedule(s)); }
    @PutMapping("/schedules/{id}")
    public ApiResult<Schedule> updateSchedule(@PathVariable String id, @RequestBody Schedule s) { return ApiResult.success(courseService.updateSchedule(id, s)); }
    @DeleteMapping("/schedules/{id}")
    public ApiResult<Void> deleteSchedule(@PathVariable String id) { courseService.deleteSchedule(id); return ApiResult.success(); }

    // ===== 统计 =====
    @GetMapping("/courses/count")
    public ApiResult<Long> courseCount() { return ApiResult.success(courseService.courseCount()); }
}
