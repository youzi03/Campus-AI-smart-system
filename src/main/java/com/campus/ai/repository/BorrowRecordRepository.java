package com.campus.ai.repository;

import com.campus.ai.entity.BorrowRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, String> {
    List<BorrowRecord> findByStudentId(String studentId);
    List<BorrowRecord> findByBookId(String bookId);
    List<BorrowRecord> findByStatus(String status);
    @Query("SELECT b FROM BorrowRecord b WHERE (:studentId IS NULL OR b.studentId = :studentId) AND (:status IS NULL OR b.status = :status) ORDER BY b.borrowDate DESC")
    List<BorrowRecord> search(@Param("studentId") String studentId, @Param("status") String status);
    long countByBookIdAndStatus(String bookId, String status);
}
