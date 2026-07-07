package com.campus.ai.repository;

import com.campus.ai.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, String> {

    /** 按姓名模糊查询 */
    List<Student> findByNameContaining(String name);

    /** 按学院查询 */
    List<Student> findByCollege(String college);

    /** 按年级查询 */
    List<Student> findByGrade(String grade);

    /** 按学籍状态查询 */
    List<Student> findByStatus(String status);

    /** 复合搜索：关键词（学号/姓名/电话）、学院、年级、状态 */
    @Query("SELECT s FROM Student s WHERE " +
           "(:keyword IS NULL OR s.id LIKE %:keyword% OR s.name LIKE %:keyword% OR s.phone LIKE %:keyword%) AND " +
           "(:college IS NULL OR s.college = :college) AND " +
           "(:grade IS NULL OR s.grade = :grade) AND " +
           "(:status IS NULL OR s.status = :status) " +
           "ORDER BY s.createAt DESC")
    List<Student> search(@Param("keyword") String keyword,
                         @Param("college") String college,
                         @Param("grade") String grade,
                         @Param("status") String status);

    /** 统计除"退学"外的在籍学生数 */
    @Query("SELECT COUNT(s) FROM Student s WHERE s.status <> '退学'")
    long countActive();

    /** 统计指定状态的学生数 */
    long countByStatus(String status);
}
