package com.campus.ai.service;

import com.campus.ai.common.BusinessException;
import com.campus.ai.common.ResourceNotFoundException;
import com.campus.ai.entity.DormAllocation;
import com.campus.ai.entity.DormRoom;
import com.campus.ai.repository.DormAllocationRepository;
import com.campus.ai.repository.DormRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DormService {

    private final DormRoomRepository dormRoomRepository;
    private final DormAllocationRepository dormAllocationRepository;

    public List<DormRoom> getRooms() { return dormRoomRepository.findAll(); }
    public List<DormRoom> searchRooms(String keyword) { return dormRoomRepository.search(blankToNull(keyword)); }
    public DormRoom getRoom(String id) { return dormRoomRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("宿舍不存在")); }
    @Transactional public DormRoom addRoom(DormRoom r) {
        if (dormRoomRepository.existsById(r.getId())) throw new BusinessException("编号已存在");
        return dormRoomRepository.save(r);
    }
    @Transactional public DormRoom updateRoom(String id, DormRoom r) {
        DormRoom e = getRoom(id);
        if (r.getBuilding() != null) e.setBuilding(r.getBuilding());
        if (r.getFloor() != null) e.setFloor(r.getFloor());
        if (r.getRoomNo() != null) e.setRoomNo(r.getRoomNo());
        if (r.getType() != null) e.setType(r.getType());
        if (r.getCapacity() != null) e.setCapacity(r.getCapacity());
        if (r.getGender() != null) e.setGender(r.getGender());
        if (r.getFee() != null) e.setFee(r.getFee());
        if (r.getStatus() != null) e.setStatus(r.getStatus());
        return dormRoomRepository.save(e);
    }
    @Transactional public void deleteRoom(String id) { getRoom(id); dormRoomRepository.deleteById(id); }

    @Transactional public DormAllocation assignRoom(String roomId, String studentId, String studentName) {
        DormRoom room = getRoom(roomId);
        long current = dormAllocationRepository.findByRoomId(roomId).stream().filter(a -> "在住".equals(a.getStatus())).count();
        if (current >= room.getCapacity()) throw new BusinessException("房间已住满");
        DormAllocation a = new DormAllocation();
        a.setId("AL" + System.currentTimeMillis());
        a.setRoomId(roomId); a.setStudentId(studentId); a.setStudentName(studentName);
        a.setCheckIn(java.time.LocalDate.now().toString()); a.setStatus("在住");
        return dormAllocationRepository.save(a);
    }
    @Transactional public void checkOut(String allocationId) {
        DormAllocation a = dormAllocationRepository.findById(allocationId).orElseThrow(() -> new ResourceNotFoundException("记录不存在"));
        a.setStatus("已退宿"); a.setCheckOut(java.time.LocalDate.now().toString());
        dormAllocationRepository.save(a);
    }
    public List<DormAllocation> getAllocations(String roomId) {
        if (roomId != null) return dormAllocationRepository.findByRoomId(roomId);
        return dormAllocationRepository.findAll();
    }

    public Map<String, Object> stats() {
        long total = dormRoomRepository.count();
        long used = dormRoomRepository.countByStatus("使用中");
        long free = dormRoomRepository.countByStatus("空闲");
        return Map.of("total", total, "used", used, "free", free);
    }
    private String blankToNull(String s) { return (s == null || s.trim().isEmpty()) ? null : s.trim(); }
}
