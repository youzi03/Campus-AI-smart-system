package com.campus.ai.service;

import com.campus.ai.common.BusinessException;
import com.campus.ai.common.ResourceNotFoundException;
import com.campus.ai.entity.*;
import com.campus.ai.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final ClassroomRepository classroomRepository;
    private final LabRepository labRepository;
    private final ScheduleRepository scheduleRepository;

    // ========== 课程 ==========
    public List<Course> getCourses() { return courseRepository.findAll(); }
    public List<Course> searchCourses(String keyword, String college, String semester) {
        return courseRepository.search(blankToNull(keyword), blankToNull(college), blankToNull(semester));
    }
    public Course getCourse(String id) {
        return courseRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("课程不存在: " + id));
    }
    @Transactional
    public Course addCourse(Course c) {
        if (courseRepository.existsById(c.getId())) throw new BusinessException("课程编号已存在：" + c.getId());
        return courseRepository.save(c);
    }
    @Transactional
    public Course updateCourse(String id, Course c) {
        Course exist = getCourse(id);
        if (c.getName() != null) exist.setName(c.getName());
        if (c.getTeacher() != null) exist.setTeacher(c.getTeacher());
        if (c.getTeacherId() != null) exist.setTeacherId(c.getTeacherId());
        if (c.getCredit() != null) exist.setCredit(c.getCredit());
        if (c.getHours() != null) exist.setHours(c.getHours());
        if (c.getCollege() != null) exist.setCollege(c.getCollege());
        if (c.getSemester() != null) exist.setSemester(c.getSemester());
        if (c.getCapacity() != null) exist.setCapacity(c.getCapacity());
        return courseRepository.save(exist);
    }
    @Transactional
    public void deleteCourse(String id) {
        getCourse(id);
        scheduleRepository.findByCourseId(id).forEach(s -> scheduleRepository.delete(s));
        courseRepository.deleteById(id);
    }
    public long courseCount() { return courseRepository.count(); }

    // ========== 教室 ==========
    public List<Classroom> getClassrooms() { return classroomRepository.findAll(); }
    public List<Classroom> searchClassrooms(String keyword, String type, String status) {
        return classroomRepository.search(blankToNull(keyword), blankToNull(type), blankToNull(status));
    }
    public Classroom getClassroom(String id) {
        return classroomRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("教室不存在: " + id));
    }
    @Transactional
    public Classroom addClassroom(Classroom r) {
        if (classroomRepository.existsById(r.getId())) throw new BusinessException("教室编号已存在：" + r.getId());
        return classroomRepository.save(r);
    }
    @Transactional
    public Classroom updateClassroom(String id, Classroom r) {
        Classroom exist = getClassroom(id);
        if (r.getName() != null) exist.setName(r.getName());
        if (r.getBuilding() != null) exist.setBuilding(r.getBuilding());
        if (r.getFloor() != null) exist.setFloor(r.getFloor());
        if (r.getCapacity() != null) exist.setCapacity(r.getCapacity());
        if (r.getType() != null) exist.setType(r.getType());
        if (r.getEquipment() != null) exist.setEquipment(r.getEquipment());
        if (r.getStatus() != null) exist.setStatus(r.getStatus());
        return classroomRepository.save(exist);
    }
    @Transactional
    public void deleteClassroom(String id) { getClassroom(id); classroomRepository.deleteById(id); }

    // ========== 实验室 ==========
    public List<Lab> getLabs() { return labRepository.findAll(); }
    public List<Lab> searchLabs(String keyword, String type, String status) {
        return labRepository.search(blankToNull(keyword), blankToNull(type), blankToNull(status));
    }
    public Lab getLab(String id) {
        return labRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("实验室不存在: " + id));
    }
    @Transactional
    public Lab addLab(Lab l) {
        if (labRepository.existsById(l.getId())) throw new BusinessException("实验室编号已存在：" + l.getId());
        return labRepository.save(l);
    }
    @Transactional
    public Lab updateLab(String id, Lab l) {
        Lab exist = getLab(id);
        if (l.getName() != null) exist.setName(l.getName());
        if (l.getBuilding() != null) exist.setBuilding(l.getBuilding());
        if (l.getFloor() != null) exist.setFloor(l.getFloor());
        if (l.getCapacity() != null) exist.setCapacity(l.getCapacity());
        if (l.getType() != null) exist.setType(l.getType());
        if (l.getPcCount() != null) exist.setPcCount(l.getPcCount());
        if (l.getManager() != null) exist.setManager(l.getManager());
        if (l.getPhone() != null) exist.setPhone(l.getPhone());
        if (l.getEquipment() != null) exist.setEquipment(l.getEquipment());
        if (l.getStatus() != null) exist.setStatus(l.getStatus());
        return labRepository.save(exist);
    }
    @Transactional
    public void deleteLab(String id) { getLab(id); labRepository.deleteById(id); }

    // ========== 课表 ==========
    public List<Schedule> getSchedules() { return scheduleRepository.findAll(); }
    public List<Schedule> searchSchedules(String teacherId, String courseId, String classGroup) {
        return scheduleRepository.search(blankToNull(teacherId), blankToNull(courseId), blankToNull(classGroup));
    }
    public Schedule getSchedule(String id) {
        return scheduleRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("课表记录不存在: " + id));
    }
    @Transactional
    public Schedule addSchedule(Schedule s) {
        if (scheduleRepository.existsById(s.getId())) throw new BusinessException("课表记录已存在：" + s.getId());
        return scheduleRepository.save(s);
    }
    @Transactional
    public Schedule updateSchedule(String id, Schedule s) {
        Schedule exist = getSchedule(id);
        if (s.getCourseId() != null) exist.setCourseId(s.getCourseId());
        if (s.getCourseName() != null) exist.setCourseName(s.getCourseName());
        if (s.getTeacherId() != null) exist.setTeacherId(s.getTeacherId());
        if (s.getTeacherName() != null) exist.setTeacherName(s.getTeacherName());
        if (s.getDay() != null) exist.setDay(s.getDay());
        if (s.getPeriod() != null) exist.setPeriod(s.getPeriod());
        if (s.getRoomId() != null) exist.setRoomId(s.getRoomId());
        if (s.getRoomName() != null) exist.setRoomName(s.getRoomName());
        if (s.getClassGroup() != null) exist.setClassGroup(s.getClassGroup());
        if (s.getWeek() != null) exist.setWeek(s.getWeek());
        if (s.getColor() != null) exist.setColor(s.getColor());
        return scheduleRepository.save(exist);
    }
    @Transactional
    public void deleteSchedule(String id) { getSchedule(id); scheduleRepository.deleteById(id); }

    private String blankToNull(String s) { return (s == null || s.trim().isEmpty()) ? null : s.trim(); }
}
