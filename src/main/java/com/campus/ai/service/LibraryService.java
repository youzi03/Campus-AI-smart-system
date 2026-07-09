package com.campus.ai.service;

import com.campus.ai.common.BusinessException;
import com.campus.ai.common.ResourceNotFoundException;
import com.campus.ai.entity.Book;
import com.campus.ai.entity.BorrowRecord;
import com.campus.ai.repository.BookRepository;
import com.campus.ai.repository.BorrowRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class LibraryService {

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    public List<Book> getBooks() { return bookRepository.findAll(); }
    public List<Book> searchBooks(String keyword, String category) { return bookRepository.search(blankToNull(keyword), blankToNull(category)); }
    public Book getBook(String id) { return bookRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("图书不存在")); }
    @Transactional public Book addBook(Book b) {
        if (bookRepository.existsById(b.getId())) throw new BusinessException("编号已存在");
        if (b.getAvailable() == null) b.setAvailable(b.getTotal());
        return bookRepository.save(b);
    }
    @Transactional public Book updateBook(String id, Book b) {
        Book e = getBook(id);
        if (b.getTitle() != null) e.setTitle(b.getTitle());
        if (b.getAuthor() != null) e.setAuthor(b.getAuthor());
        if (b.getIsbn() != null) e.setIsbn(b.getIsbn());
        if (b.getCategory() != null) e.setCategory(b.getCategory());
        if (b.getPublisher() != null) e.setPublisher(b.getPublisher());
        if (b.getPubYear() != null) e.setPubYear(b.getPubYear());
        if (b.getTotal() != null) e.setTotal(b.getTotal());
        if (b.getAvailable() != null) e.setAvailable(b.getAvailable());
        if (b.getPrice() != null) e.setPrice(b.getPrice());
        if (b.getLocation() != null) e.setLocation(b.getLocation());
        return bookRepository.save(e);
    }
    @Transactional public void deleteBook(String id) { getBook(id); bookRepository.deleteById(id); }

    public List<BorrowRecord> getBorrowRecords(String studentId, String status) { return borrowRecordRepository.search(blankToNull(studentId), blankToNull(status)); }
    @Transactional public BorrowRecord borrowBook(String bookId, String studentId, String studentName) {
        Book book = getBook(bookId);
        if (book.getAvailable() == null || book.getAvailable() <= 0) throw new BusinessException("该书已无库存");
        BorrowRecord r = new BorrowRecord();
        r.setId("BR" + System.currentTimeMillis());
        r.setBookId(bookId); r.setBookTitle(book.getTitle()); r.setStudentId(studentId); r.setStudentName(studentName);
        r.setBorrowDate(java.time.LocalDate.now().toString());
        r.setDueDate(java.time.LocalDate.now().plusDays(30).toString());
        r.setStatus("借阅中");
        book.setAvailable(book.getAvailable() - 1);
        bookRepository.save(book);
        return borrowRecordRepository.save(r);
    }
    @Transactional public void returnBook(String recordId) {
        BorrowRecord r = borrowRecordRepository.findById(recordId).orElseThrow(() -> new ResourceNotFoundException("记录不存在"));
        r.setStatus("已归还"); r.setReturnDate(java.time.LocalDate.now().toString());
        borrowRecordRepository.save(r);
        Book book = getBook(r.getBookId());
        book.setAvailable(book.getAvailable() != null ? book.getAvailable() + 1 : 1);
        bookRepository.save(book);
    }
    @Transactional public void renewBook(String recordId) {
        BorrowRecord r = borrowRecordRepository.findById(recordId).orElseThrow(() -> new ResourceNotFoundException("记录不存在"));
        if (!"借阅中".equals(r.getStatus())) throw new BusinessException("只有借阅中的记录才能续借");
        r.setDueDate(java.time.LocalDate.parse(r.getDueDate()).plusDays(30).toString());
        borrowRecordRepository.save(r);
    }
    @Transactional public void deleteBorrowRecord(String id) {
        borrowRecordRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("借阅记录不存在"));
        borrowRecordRepository.deleteById(id);
    }
    public List<BorrowRecord> getOverdueRecords() {
        return borrowRecordRepository.findByStatus("借阅中").stream()
                .filter(r -> r.getDueDate() != null && r.getDueDate().compareTo(java.time.LocalDate.now().toString()) < 0)
                .toList();
    }
    public List<BorrowRecord> getBorrowsByStudent(String studentId) { return borrowRecordRepository.findByStudentId(studentId); }

    private String blankToNull(String s) { return (s == null || s.trim().isEmpty()) ? null : s.trim(); }
}
