package com.campus.ai.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notice")
public class Notice {
    @Id @Column(length = 50)
    private String id;
    @Column(length = 200, nullable = false)
    private String title;
    @Column(length = 20)
    private String type;
    @Column(length = 20)
    private String level;
    @Column(length = 50)
    private String target;
    @Column(length = 50)
    private String publisher;
    @Column(columnDefinition = "TEXT")
    private String content;
    @Column(length = 20)
    private String createAt;
    private Integer views = 0;
    private Boolean pinned = false;
    @Column(updatable = false)
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @PrePersist
    protected void onCreate() { createTime = LocalDateTime.now(); updateTime = LocalDateTime.now(); }
    @PreUpdate
    protected void onUpdate() { updateTime = LocalDateTime.now(); }
}
