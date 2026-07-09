package com.campus.ai.service;

import com.campus.ai.common.BusinessException;
import com.campus.ai.common.ResourceNotFoundException;
import com.campus.ai.entity.Notice;
import com.campus.ai.repository.NoticeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

    public List<Notice> getNotices() {
        return noticeRepository.findAll().stream()
                .sorted((a, b) -> {
                    if (Boolean.TRUE.equals(a.getPinned()) != Boolean.TRUE.equals(b.getPinned()))
                        return Boolean.TRUE.equals(a.getPinned()) ? -1 : 1;
                    return b.getCreateAt() != null ? b.getCreateAt().compareTo(a.getCreateAt() != null ? a.getCreateAt() : "") : 1;
                })
                .toList();
    }
    public List<Notice> searchNotices(String keyword, String type, String level) {
        return noticeRepository.search(blankToNull(keyword), blankToNull(type), blankToNull(level));
    }
    public Notice getNotice(String id) {
        return noticeRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("公告不存在: " + id));
    }
    @Transactional
    public Notice addNotice(Notice n) {
        n.setViews(0);
        if (n.getPinned() == null) n.setPinned(false);
        // 自动生成 ID（兼容前端未传 ID 的情况）
        if (n.getId() == null || n.getId().isBlank()) {
            n.setId("N" + System.currentTimeMillis());
        }
        return noticeRepository.save(n);
    }
    @Transactional
    public Notice updateNotice(String id, Notice n) {
        Notice exist = getNotice(id);
        if (n.getTitle() != null) exist.setTitle(n.getTitle());
        if (n.getType() != null) exist.setType(n.getType());
        if (n.getLevel() != null) exist.setLevel(n.getLevel());
        if (n.getTarget() != null) exist.setTarget(n.getTarget());
        if (n.getPublisher() != null) exist.setPublisher(n.getPublisher());
        if (n.getContent() != null) exist.setContent(n.getContent());
        if (n.getPinned() != null) exist.setPinned(n.getPinned());
        if (n.getViews() != null) exist.setViews(n.getViews());
        return noticeRepository.save(exist);
    }
    @Transactional
    public void deleteNotice(String id) {
        if (id == null || id.isBlank()) {
            throw new BusinessException("公告 ID 不能为空");
        }
        getNotice(id);
        noticeRepository.deleteById(id);
    }
    @Transactional
    public Notice togglePin(String id) {
        if (id == null || id.isBlank()) {
            throw new BusinessException("公告 ID 不能为空");
        }
        Notice n = getNotice(id);
        n.setPinned(!Boolean.TRUE.equals(n.getPinned()));
        return noticeRepository.save(n);
    }

    /** 推送公告（标记已推送） */
    @Transactional
    public void pushNotice(String id) {
        if (id == null || id.isBlank()) {
            throw new BusinessException("公告 ID 不能为空");
        }
        Notice n = getNotice(id);
        if (n.getViews() == null) n.setViews(0);
        n.setViews(n.getViews() + 1);
        noticeRepository.save(n);
        log.info("公告已推送: {}", id);
    }
    public long noticeCount() { return noticeRepository.count(); }

    private String blankToNull(String s) { return (s == null || s.trim().isEmpty()) ? null : s.trim(); }
}
