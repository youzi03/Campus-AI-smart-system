package com.campus.ai.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "dorm_room")
public class DormRoom {
    @Id @Column(length = 50) private String id;
    @Column(length = 20) private String building;
    private Integer floor;
    @Column(length = 20) private String roomNo;
    @Column(length = 20) private String type;
    private Integer capacity;
    @Column(length = 10) private String gender;
    private Integer fee;
    @Column(length = 20) private String status;
    @Column(updatable = false) private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @PrePersist protected void onCreate() { createTime = LocalDateTime.now(); updateTime = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updateTime = LocalDateTime.now(); }
}
