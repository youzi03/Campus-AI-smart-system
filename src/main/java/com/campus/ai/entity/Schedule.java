package com.campus.ai.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "schedule")
public class Schedule {
    @Id @Column(length = 50)
    private String id;
    @Column(length = 50)
    private String courseId;
    @Column(length = 100)
    private String courseName;
    @Column(length = 50)
    private String teacherId;
    @Column(length = 50)
    private String teacherName;
    private Integer day;
    private Integer period;
    @Column(length = 50)
    private String roomId;
    @Column(length = 100)
    private String roomName;
    @Column(length = 100)
    private String classGroup;
    @Column(length = 50)
    private String week;
    @Column(length = 20)
    private String color;
    @Column(updatable = false)
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @PrePersist
    protected void onCreate() { createTime = LocalDateTime.now(); updateTime = LocalDateTime.now(); }
    @PreUpdate
    protected void onUpdate() { updateTime = LocalDateTime.now(); }
}
