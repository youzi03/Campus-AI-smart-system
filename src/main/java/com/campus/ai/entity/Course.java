package com.campus.ai.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "course")
public class Course {
    @Id @Column(length = 50)
    private String id;
    @Column(nullable = false, length = 100)
    private String name;
    @Column(length = 50)
    private String teacher;
    @Column(length = 50)
    private String teacherId;
    private Integer credit;
    private Integer hours;
    @Column(length = 50)
    private String college;
    @Column(length = 50)
    private String semester;
    private Integer capacity;
    @Column(updatable = false)
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @PrePersist
    protected void onCreate() { createTime = LocalDateTime.now(); updateTime = LocalDateTime.now(); }
    @PreUpdate
    protected void onUpdate() { updateTime = LocalDateTime.now(); }
}
