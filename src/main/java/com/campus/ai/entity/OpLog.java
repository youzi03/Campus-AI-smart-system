package com.campus.ai.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

/**
 * 操作日志实体
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "op_log")
public class OpLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 操作类型：新增/编辑/删除/状态变更/批量新增/批量状态变更 */
    @Column(length = 20, nullable = false)
    private String type;

    /** 操作对象：学生/教师 */
    @Column(length = 20)
    private String target;

    /** 目标 ID */
    @Column(length = 100)
    private String targetId;

    /** 操作人 */
    @Column(length = 50)
    private String operator;

    /** 操作详情 */
    @Column(length = 500)
    private String detail;

    /** 操作时间（字符串格式） */
    @Column(length = 30)
    private String time;

    @Column(updatable = false)
    private LocalDateTime createTime;

    @PrePersist
    protected void onCreate() {
        createTime = LocalDateTime.now();
        if (time == null) {
            time = java.time.LocalDateTime.now()
                    .format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"));
        }
        if (operator == null) operator = "管理员";
    }
}
