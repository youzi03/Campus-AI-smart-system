package com.campus.ai.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * 注册证书 — 用于验证教师/管理员的注册资格
 * 预设证书由 DataInitializer 写入数据库
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "registration_certificate")
public class RegistrationCertificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 证书类型：teacher / admin */
    @Column(length = 20, nullable = false)
    private String type;

    /** 证书验证码 */
    @Column(length = 100, nullable = false)
    private String code;

    /** 证书用途说明 */
    @Column(length = 200)
    private String description;

    /** 是否已被使用（0=未使用, 1=已使用） */
    @Column(nullable = false)
    private Integer used = 0;

    @Column(updatable = false)
    private LocalDateTime createTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        if (used == null) used = 0;
    }
}
