package com.campus.ai.controller;

import com.campus.ai.common.ApiResult;
import com.campus.ai.entity.Book;
import com.campus.ai.entity.BorrowRecord;
import com.campus.ai.service.LibraryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api") @RequiredArgsConstructor
public class LibraryController {
    private final LibraryService libraryService;

    @GetMapping("/books")
    public ApiResult<List<Book>> listBooks(@RequestParam(required=false) String keyword, @RequestParam(required=false) String category) { return ApiResult.success(libraryService.searchBooks(keyword, category)); }
    @GetMapping("/books/{id}")
    public ApiResult<Book> getBook(@PathVariable String id) { return ApiResult.success(libraryService.getBook(id)); }
    @PostMapping("/books")
    public ApiResult<Book> addBook(@RequestBody Book b) { return ApiResult.success(libraryService.addBook(b)); }
    @PutMapping("/books/{id}")
    public ApiResult<Book> updateBook(@PathVariable String id, @RequestBody Book b) { return ApiResult.success(libraryService.updateBook(id, b)); }
    @DeleteMapping("/books/{id}")
    public ApiResult<Void> deleteBook(@PathVariable String id) { libraryService.deleteBook(id); return ApiResult.success(); }

    @GetMapping("/borrow-records")
    public ApiResult<List<BorrowRecord>> listBorrows(@RequestParam(required=false) String studentId, @RequestParam(required=false) String status) { return ApiResult.success(libraryService.getBorrowRecords(studentId, status)); }
    @PostMapping("/borrow-records")
    public ApiResult<BorrowRecord> borrowBook(@RequestBody Map<String,String> body) { return ApiResult.success(libraryService.borrowBook(body.get("bookId"), body.get("studentId"), body.get("studentName"))); }
    @PutMapping("/borrow-records/{id}/return")
    public ApiResult<Void> returnBook(@PathVariable String id) { libraryService.returnBook(id); return ApiResult.success(); }
    @PutMapping("/borrow-records/{id}/renew")
    public ApiResult<Void> renewBook(@PathVariable String id) { libraryService.renewBook(id); return ApiResult.success(); }
    @DeleteMapping("/borrow-records/{id}")
    public ApiResult<Void> deleteBorrow(@PathVariable String id) { libraryService.deleteBorrowRecord(id); return ApiResult.success(); }
    @GetMapping("/borrow-records/overdue")
    public ApiResult<List<BorrowRecord>> overdue() { return ApiResult.success(libraryService.getOverdueRecords()); }
}
