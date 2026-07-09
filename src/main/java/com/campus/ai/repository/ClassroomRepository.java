package com.campus.ai.repository;

import com.campus.ai.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, String> {
    List<Classroom> findByStatus(String status);
    @Query("SELECT c FROM Classroom c WHERE " +
           "(:keyword IS NULL OR c.id LIKE %:keyword% OR c.name LIKE %:keyword%) AND " +
           "(:type IS NULL OR c.type = :type) AND " +
           "(:status IS NULL OR c.status = :status) " +
           "ORDER BY c.id ASC")
    List<Classroom> search(@Param("keyword") String keyword,
                           @Param("type") String type,
                           @Param("status") String status);
}
