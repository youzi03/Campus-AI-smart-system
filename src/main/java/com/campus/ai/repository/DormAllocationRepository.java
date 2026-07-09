package com.campus.ai.repository;

import com.campus.ai.entity.DormAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DormAllocationRepository extends JpaRepository<DormAllocation, String> {
    List<DormAllocation> findByRoomId(String roomId);
    List<DormAllocation> findByStudentId(String studentId);
    List<DormAllocation> findByStatus(String status);
}
