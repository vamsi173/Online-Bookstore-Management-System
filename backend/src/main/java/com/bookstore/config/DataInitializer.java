package com.bookstore.config;

import com.bookstore.model.Book;
import com.bookstore.model.User;
import com.bookstore.model.Role;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Check if books already exist to avoid duplication
        if (bookRepository.count() == 0) {
            // Add sample books
            Book book1 = new Book("The Great Gatsby", "F. Scott Fitzgerald", 12.99, "Fiction", 
                "A classic American novel set in the Jazz Age.", 
                "https://via.placeholder.com/200x300.png?text=The+Great+Gatsby", 50);
            book1.setCreatedAt(LocalDateTime.now());
            
            Book book2 = new Book("To Kill a Mockingbird", "Harper Lee", 14.99, "Fiction", 
                "A gripping tale of racial injustice and childhood innocence.", 
                "https://via.placeholder.com/200x300.png?text=To+Kill+a+Mockingbird", 45);
            book2.setCreatedAt(LocalDateTime.now());
            
            Book book3 = new Book("1984", "George Orwell", 13.99, "Dystopian", 
                "A dystopian social science fiction novel.", 
                "https://via.placeholder.com/200x300.png?text=1984", 60);
            book3.setCreatedAt(LocalDateTime.now());
            
            Book book4 = new Book("Pride and Prejudice", "Jane Austen", 11.99, "Romance", 
                "A romantic novel of manners written by Jane Austen.", 
                "https://via.placeholder.com/200x300.png?text=Pride+and+Prejudice", 40);
            book4.setCreatedAt(LocalDateTime.now());
            
            Book book5 = new Book("The Catcher in the Rye", "J.D. Salinger", 12.49, "Fiction", 
                "A story about teenage rebellion and angst.", 
                "https://via.placeholder.com/200x300.png?text=Catcher+in+the+Rye", 35);
            book5.setCreatedAt(LocalDateTime.now());
            
            Book book6 = new Book("The Lord of the Rings", "J.R.R. Tolkien", 24.99, "Fantasy", 
                "An epic high-fantasy novel.", 
                "https://via.placeholder.com/200x300.png?text=Lord+of+the+Rings", 25);
            book6.setCreatedAt(LocalDateTime.now());
            
            Book book7 = new Book("Harry Potter and the Sorcerer Stone", "J.K. Rowling", 16.99, "Fantasy", 
                "A fantasy novel for children.", 
                "https://via.placeholder.com/200x300.png?text=Harry+Potter", 70);
            book7.setCreatedAt(LocalDateTime.now());
            
            Book book8 = new Book("The Hobbit", "J.R.R. Tolkien", 15.99, "Fantasy", 
                "A children's fantasy novel.", 
                "https://via.placeholder.com/200x300.png?text=The+Hobbit", 30);
            book8.setCreatedAt(LocalDateTime.now());
            
            Book book9 = new Book("Brave New World", "Aldous Huxley", 14.49, "Dystopian", 
                "A dystopian novel set in a futuristic world.", 
                "https://via.placeholder.com/200x300.png?text=Brave+New+World", 38);
            book9.setCreatedAt(LocalDateTime.now());
            
            Book book10 = new Book("The Da Vinci Code", "Dan Brown", 18.99, "Mystery", 
                "A mystery thriller novel.", 
                "https://via.placeholder.com/200x300.png?text=Da+Vinci+Code", 42);
            book10.setCreatedAt(LocalDateTime.now());

            bookRepository.save(book1);
            bookRepository.save(book2);
            bookRepository.save(book3);
            bookRepository.save(book4);
            bookRepository.save(book5);
            bookRepository.save(book6);
            bookRepository.save(book7);
            bookRepository.save(book8);
            bookRepository.save(book9);
            bookRepository.save(book10);
            
            System.out.println("Sample books have been added to the database.");
        } else {
            System.out.println("Books already exist in the database. Skipping sample data insertion.");
        }
        
        // Check if users already exist
        if (userRepository.count() == 0) {
            // Add sample users
            User user1 = new User();
            user1.setName("John Doe");
            user1.setEmail("john.doe@example.com");
            user1.setPassword(passwordEncoder.encode("password"));
            user1.setRole(Role.USER);
            
            User user2 = new User();
            user2.setName("Jane Smith");
            user2.setEmail("jane.smith@example.com");
            user2.setPassword(passwordEncoder.encode("password"));
            user2.setRole(Role.USER);
            
            User user3 = new User();
            user3.setName("Robert Johnson");
            user3.setEmail("robert.j@example.com");
            user3.setPassword(passwordEncoder.encode("password"));
            user3.setRole(Role.USER);
            
            User user4 = new User();
            user4.setName("Emily Davis");
            user4.setEmail("emily.d@example.com");
            user4.setPassword(passwordEncoder.encode("password"));
            user4.setRole(Role.USER);
            
            User user5 = new User();
            user5.setName("Michael Wilson");
            user5.setEmail("michael.w@example.com");
            user5.setPassword(passwordEncoder.encode("password"));
            user5.setRole(Role.USER);

            userRepository.save(user1);
            userRepository.save(user2);
            userRepository.save(user3);
            userRepository.save(user4);
            userRepository.save(user5);
            
            System.out.println("Sample users have been added to the database.");
        } else {
            System.out.println("Users already exist in the database. Skipping sample data insertion.");
        }
    }
}