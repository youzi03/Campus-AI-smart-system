package com.campus.ai.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data @Entity @Table(name = "book")
public class Book {
    @Id @Column(length = 50) private String id;
    @Column(length = 50) private String isbn;
    @Column(length = 200) private String title;
    @Column(length = 100) private String author;
    @Column(length = 100) private String publisher;
    @Column(length = 50) private String category;
    private Integer pubYear;
    private Integer total;
    private Integer available;
    private Double price;
    @Column(length = 50) private String location;
    @Column(updatable = false) private LocalDateTime createTime;
    private LocalDateTime updateTime;
    @PrePersist protected void onCreate() { createTime = LocalDateTime.now(); updateTime = LocalDateTime.now(); }
    @PreUpdate protected void onUpdate() { updateTime = LocalDateTime.now(); }
}
