package com.campus.ai.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "borrow_record")
public class BorrowRecord {
    @Id @Column(length = 50) private String id;
    @Column(length = 50) private String bookId;
    @Column(length = 200) private String bookTitle;
    @Column(length = 50) private String studentId;
    @Column(length = 50) private String studentName;
    @Column(length = 20) private String borrowDate;
    @Column(length = 20) private String dueDate;
    @Column(length = 20) private String returnDate;
    @Column(length = 20) private String status;
    @Column(updatable = false) private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @PrePersist protected void onCreate() { createTime = LocalDateTime.now(); updateTime = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updateTime = LocalDateTime.now(); }
}
