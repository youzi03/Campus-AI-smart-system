package com.campus.ai.repository;

import com.campus.ai.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, String> {
    List<Course> findByCollege(String college);
    List<Course> findBySemester(String semester);
    @Query("SELECT c FROM Course c WHERE " +
           "(:keyword IS NULL OR c.id LIKE %:keyword% OR c.name LIKE %:keyword% OR c.teacher LIKE %:keyword%) AND " +
           "(:college IS NULL OR c.college = :college) AND " +
           "(:semester IS NULL OR c.semester = :semester) " +
           "ORDER BY c.id ASC")
    List<Course> search(@Param("keyword") String keyword,
                        @Param("college") String college,
                        @Param("semester") String semester);
}
