package com.campus.ai.repository;

import com.campus.ai.entity.DormRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DormRoomRepository extends JpaRepository<DormRoom, String> {
    List<DormRoom> findByBuilding(String building);
    List<DormRoom> findByGender(String gender);
    List<DormRoom> findByStatus(String status);
    long countByStatus(String status);
    long count();
    @Query("SELECT d FROM DormRoom d WHERE (:keyword IS NULL OR d.id LIKE %:keyword% OR d.roomNo LIKE %:keyword%) ORDER BY d.id ASC")
    List<DormRoom> search(@Param("keyword") String keyword);
}
