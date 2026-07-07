package com.campus.ai.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * 学生信息实体
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "student")
public class Student {

    /** 学号（业务主键） */
    @Id
    @Column(length = 50)
    private String id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(length = 10)
    private String gender;

    @Column(length = 20)
    private String birth;

    @Column(length = 50)
    private String college;

    @Column(length = 50)
    private String major;

    @Column(length = 10)
    private String grade;

    @Column(length = 20)
    private String phone;

    @Column(length = 50)
    private String dorm;

    /** 学籍状态：在读/休学/退学/毕业 */
    @Column(length = 20, nullable = false)
    private String status;

    @Column(length = 50)
    private String statusChangeAt;

    @Column(length = 50)
    private String statusOperator;

    @Column(length = 20)
    private String createAt;

    @Column(updatable = false)
    private LocalDateTime createTime;

    private LocalDateTime updateTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        updateTime = LocalDateTime.now();
        if (status == null) status = "在读";
        if (createAt == null) {
            java.time.LocalDate d = java.time.LocalDate.now();
            createAt = d.toString();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updateTime = LocalDateTime.now();
    }
}
