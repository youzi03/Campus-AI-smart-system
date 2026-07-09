package com.campus.ai.repository;

import com.campus.ai.entity.Lab;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LabRepository extends JpaRepository<Lab, String> {
    List<Lab> findByStatus(String status);
    @Query("SELECT l FROM Lab l WHERE " +
           "(:keyword IS NULL OR l.id LIKE %:keyword% OR l.name LIKE %:keyword%) AND " +
           "(:type IS NULL OR l.type = :type) AND " +
           "(:status IS NULL OR l.status = :status) " +
           "ORDER BY l.id ASC")
    List<Lab> search(@Param("keyword") String keyword,
                     @Param("type") String type,
                     @Param("status") String status);
}
