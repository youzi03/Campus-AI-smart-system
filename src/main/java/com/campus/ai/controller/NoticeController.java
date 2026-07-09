package com.campus.ai.controller;

import com.campus.ai.common.ApiResult;
import com.campus.ai.common.PageResult;
import com.campus.ai.entity.Notice;
import com.campus.ai.service.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    @GetMapping("/notices")
    public ApiResult<PageResult<Notice>> listNotices(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String level,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int size) {
        return ApiResult.success(PageResult.slice(noticeService.searchNotices(keyword, type, level), page, size));
    }
    @GetMapping("/notices/all")
    public ApiResult<List<Notice>> allNotices() { return ApiResult.success(noticeService.getNotices()); }
    @GetMapping("/notices/{id}")
    public ApiResult<Notice> getNotice(@PathVariable String id) { return ApiResult.success(noticeService.getNotice(id)); }
    @PostMapping("/notices")
    public ApiResult<Notice> addNotice(@RequestBody Notice n) { return ApiResult.success(noticeService.addNotice(n)); }
    @PutMapping("/notices/{id}")
    public ApiResult<Notice> updateNotice(@PathVariable String id, @RequestBody Notice n) { return ApiResult.success(noticeService.updateNotice(id, n)); }
    @DeleteMapping("/notices/{id}")
    public ApiResult<Void> deleteNotice(@PathVariable String id) { noticeService.deleteNotice(id); return ApiResult.success(); }
    @PutMapping("/notices/{id}/pin")
    public ApiResult<Notice> togglePin(@PathVariable String id) { return ApiResult.success(noticeService.togglePin(id)); }
    @GetMapping("/notices/count")
    public ApiResult<Long> count() { return ApiResult.success(noticeService.noticeCount()); }
}
