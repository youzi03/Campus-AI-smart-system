package com.campus.ai.controller;

import com.campus.ai.common.ApiResult;
import com.campus.ai.entity.DormAllocation;
import com.campus.ai.entity.DormRoom;
import com.campus.ai.service.DormService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class DormController {
    private final DormService dormService;

    @GetMapping("/dorm-rooms")
    public ApiResult<List<DormRoom>> listRooms(@RequestParam(required=false) String keyword) { return ApiResult.success(dormService.searchRooms(keyword)); }
    @GetMapping("/dorm-rooms/{id}")
    public ApiResult<DormRoom> getRoom(@PathVariable String id) { return ApiResult.success(dormService.getRoom(id)); }
    @PostMapping("/dorm-rooms")
    public ApiResult<DormRoom> addRoom(@RequestBody DormRoom r) { return ApiResult.success(dormService.addRoom(r)); }
    @PutMapping("/dorm-rooms/{id}")
    public ApiResult<DormRoom> updateRoom(@PathVariable String id, @RequestBody DormRoom r) { return ApiResult.success(dormService.updateRoom(id, r)); }
    @DeleteMapping("/dorm-rooms/{id}")
    public ApiResult<Void> deleteRoom(@PathVariable String id) { dormService.deleteRoom(id); return ApiResult.success(); }
    @GetMapping("/dorm-rooms/stats")
    public ApiResult<Map<String, Object>> stats() { return ApiResult.success(dormService.stats()); }

    @GetMapping("/dorm-allocations")
    public ApiResult<List<DormAllocation>> listAllocations(@RequestParam(required=false) String roomId) { return ApiResult.success(dormService.getAllocations(roomId)); }
    @PostMapping("/dorm-allocations")
    public ApiResult<DormAllocation> assignRoom(@RequestBody Map<String,String> body) { return ApiResult.success(dormService.assignRoom(body.get("roomId"), body.get("studentId"), body.get("studentName"))); }
    @PutMapping("/dorm-allocations/{id}/checkout")
    public ApiResult<Void> checkOut(@PathVariable String id) { dormService.checkOut(id); return ApiResult.success(); }
    @DeleteMapping("/dorm-allocations/{id}")
    public ApiResult<Void> deleteAllocation(@PathVariable String id) { dormService.deleteAllocation(id); return ApiResult.success(); }
}
