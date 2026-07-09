package com.campus.ai.repository;

import com.campus.ai.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, String> {
    List<Schedule> findByCourseId(String courseId);
    List<Schedule> findByTeacherId(String teacherId);
    @Query("SELECT s FROM Schedule s WHERE " +
           "(:teacherId IS NULL OR s.teacherId = :teacherId) AND " +
           "(:courseId IS NULL OR s.courseId = :courseId) AND " +
           "(:classGroup IS NULL OR s.classGroup LIKE %:classGroup%) " +
           "ORDER BY s.day ASC, s.period ASC")
    List<Schedule> search(@Param("teacherId") String teacherId,
                          @Param("courseId") String courseId,
                          @Param("classGroup") String classGroup);
}
