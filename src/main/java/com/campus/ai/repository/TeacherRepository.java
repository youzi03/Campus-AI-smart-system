package com.campus.ai.repository;

import com.campus.ai.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, String> {

    /** 按姓名模糊查询 */
    List<Teacher> findByNameContaining(String name);

    /** 按学院查询 */
    List<Teacher> findByCollege(String college);

    /** 按职称查询 */
    List<Teacher> findByTitle(String title);

    /** 复合搜索 */
    @Query("SELECT t FROM Teacher t WHERE " +
           "(:keyword IS NULL OR t.id LIKE %:keyword% OR t.name LIKE %:keyword% OR t.phone LIKE %:keyword%) AND " +
           "(:college IS NULL OR t.college = :college) AND " +
           "(:title IS NULL OR t.title = :title) " +
           "ORDER BY t.id ASC")
    List<Teacher> search(@Param("keyword") String keyword,
                         @Param("college") String college,
                         @Param("title") String title);
}
