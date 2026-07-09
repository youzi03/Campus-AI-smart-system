package com.campus.ai.repository;

import com.campus.ai.entity.Score;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ScoreRepository extends JpaRepository<Score, String> {
    List<Score> findByStudentId(String studentId);
    List<Score> findByCourseId(String courseId);
    List<Score> findBySemester(String semester);
    @Query("SELECT s FROM Score s WHERE " +
           "(:studentId IS NULL OR s.studentId = :studentId) AND " +
           "(:courseId IS NULL OR s.courseId = :courseId) AND " +
           "(:semester IS NULL OR s.semester = :semester) " +
           "ORDER BY s.createTime DESC")
    List<Score> search(@Param("studentId") String studentId,
                       @Param("courseId") String courseId,
                       @Param("semester") String semester);
    boolean existsByStudentIdAndCourseIdAndSemester(String studentId, String courseId, String semester);
    @Query("SELECT s FROM Score s WHERE s.score < 60 ORDER BY s.createTime DESC")
    List<Score> findWarnings();
}
