package com.campus.ai.repository;

import com.campus.ai.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, String> {
    List<Book> findByCategory(String category);
    @Query("SELECT b FROM Book b WHERE (:keyword IS NULL OR b.title LIKE %:keyword% OR b.author LIKE %:keyword% OR b.isbn LIKE %:keyword%) AND (:category IS NULL OR b.category = :category) ORDER BY b.id ASC")
    List<Book> search(@Param("keyword") String keyword, @Param("category") String category);
}
