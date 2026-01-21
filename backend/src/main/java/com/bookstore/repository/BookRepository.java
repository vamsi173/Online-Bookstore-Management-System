package com.bookstore.repository;

import com.bookstore.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByCategory(String category);
    List<Book> findByTitleContainingIgnoreCase(String title);
    List<Book> findByAuthorContainingIgnoreCase(String author);
    
    @Query("SELECT b FROM Book b WHERE LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(@Param("query") String query);
    
    @Query("SELECT DISTINCT b.category FROM Book b WHERE b.category IS NOT NULL ORDER BY b.category")
    List<String> findAllCategories();
}