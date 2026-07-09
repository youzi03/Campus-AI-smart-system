package com.campus.ai.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "score")
public class Score {
    @Id @Column(length = 50)
    private String id;
    @Column(length = 50, nullable = false)
    private String studentId;
    @Column(length = 50)
    private String studentName;
    @Column(length = 50, nullable = false)
    private String courseId;
    @Column(length = 100)
    private String courseName;
    private Double score;
    @Column(length = 50)
    private String semester;
    @Column(length = 20)
    private String type;
    @Column(length = 20)
    private String inputAt;
    @Column(updatable = false)
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @PrePersist
    protected void onCreate() { createTime = LocalDateTime.now(); updateTime = LocalDateTime.now(); }
    @PreUpdate
    protected void onUpdate() { updateTime = LocalDateTime.now(); }
}
