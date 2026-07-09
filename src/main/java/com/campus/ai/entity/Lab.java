package com.campus.ai.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "lab")
public class Lab {
    @Id @Column(length = 50)
    private String id;
    @Column(length = 100)
    private String name;
    @Column(length = 50)
    private String building;
    private Integer floor;
    private Integer capacity;
    @Column(length = 50)
    private String type;
    private Integer pcCount;
    @Column(length = 50)
    private String manager;
    @Column(length = 20)
    private String phone;
    @Column(length = 200)
    private String equipment;
    @Column(length = 20)
    private String status;
    @Column(updatable = false)
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @PrePersist
    protected void onCreate() { createTime = LocalDateTime.now(); updateTime = LocalDateTime.now(); }
    @PreUpdate
    protected void onUpdate() { updateTime = LocalDateTime.now(); }
}
