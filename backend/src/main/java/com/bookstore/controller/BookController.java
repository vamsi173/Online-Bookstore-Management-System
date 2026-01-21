package com.bookstore.controller;

import com.bookstore.model.Book;
import com.bookstore.repository.BookRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    private BookRepository bookRepository;

    @GetMapping
    public ResponseEntity<List<Book>> getAllBooks() {
        List<Book> books = bookRepository.findAll();
        return ResponseEntity.ok(books);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<Book>> getBooksByCategory(@PathVariable String category) {
        List<Book> books = bookRepository.findByCategory(category);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Book>> searchBooks(@RequestParam String query) {
        List<Book> books = bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(query);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/title/{title}")
    public ResponseEntity<List<Book>> getBooksByTitle(@PathVariable String title) {
        List<Book> books = bookRepository.findByTitleContainingIgnoreCase(title);
        return ResponseEntity.ok(books);
    }

    @GetMapping("/author/{author}")
    public ResponseEntity<List<Book>> getBooksByAuthor(@PathVariable String author) {
        List<Book> books = bookRepository.findByAuthorContainingIgnoreCase(author);
        return ResponseEntity.ok(books);
    }
    
    @PostMapping
    public ResponseEntity<Book> createBook(@RequestBody Book book) {
        Book savedBook = bookRepository.save(book);
        return ResponseEntity.ok(savedBook);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @RequestBody Book book) {
        book.setBookId(id);
        Book updatedBook = bookRepository.save(book);
        return ResponseEntity.ok(updatedBook);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(@PathVariable Long id) {
        bookRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = bookRepository.findAllCategories();
        return ResponseEntity.ok(categories);
    }
}