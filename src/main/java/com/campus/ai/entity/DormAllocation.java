package com.campus.ai.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "dorm_allocation")
public class DormAllocation {
    @Id @Column(length = 50) private String id;
    @Column(length = 50) private String roomId;
    @Column(length = 50) private String studentId;
    @Column(length = 50) private String studentName;
    @Column(length = 20) private String checkIn;
    @Column(length = 20) private String checkOut;
    @Column(length = 20) private String status;
    @Column(updatable = false) private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @PrePersist protected void onCreate() { createTime = LocalDateTime.now(); updateTime = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updateTime = LocalDateTime.now(); }
}
