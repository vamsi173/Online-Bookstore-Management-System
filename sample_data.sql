-- Sample data for the Online Book Store

-- Insert sample books
INSERT INTO books (title, author, price, category, description, image_url, stock) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', 12.99, 'Fiction', 'A classic American novel set in the Jazz Age.', 'https://via.placeholder.com/200x300.png?text=The+Great+Gatsby', 50),
('To Kill a Mockingbird', 'Harper Lee', 14.99, 'Fiction', 'A gripping tale of racial injustice and childhood innocence.', 'https://via.placeholder.com/200x300.png?text=To+Kill+a+Mockingbird', 45),
('1984', 'George Orwell', 13.99, 'Dystopian', 'A dystopian social science fiction novel.', 'https://via.placeholder.com/200x300.png?text=1984', 60),
('Pride and Prejudice', 'Jane Austen', 11.99, 'Romance', 'A romantic novel of manners written by Jane Austen.', 'https://via.placeholder.com/200x300.png?text=Pride+and+Prejudice', 40),
('The Catcher in the Rye', 'J.D. Salinger', 12.49, 'Fiction', 'A story about teenage rebellion and angst.', 'https://via.placeholder.com/200x300.png?text=Catcher+in+the+Rye', 35),
('The Lord of the Rings', 'J.R.R. Tolkien', 24.99, 'Fantasy', 'An epic high-fantasy novel.', 'https://via.placeholder.com/200x300.png?text=Lord+of+the+Rings', 25),
('Harry Potter and the Sorcerer Stone', 'J.K. Rowling', 16.99, 'Fantasy', 'A fantasy novel for children.', 'https://via.placeholder.com/200x300.png?text=Harry+Potter', 70),
('The Hobbit', 'J.R.R. Tolkien', 15.99, 'Fantasy', 'A children\'s fantasy novel.', 'https://via.placeholder.com/200x300.png?text=The+Hobbit', 30),
('Brave New World', 'Aldous Huxley', 14.49, 'Dystopian', 'A dystopian novel set in a futuristic world.', 'https://via.placeholder.com/200x300.png?text=Brave+New+World', 38),
('The Da Vinci Code', 'Dan Brown', 18.99, 'Mystery', 'A mystery thriller novel.', 'https://via.placeholder.com/200x300.png?text=Da+Vinci+Code', 42);

-- Insert more sample users (excluding the ones already in the system)
INSERT INTO users (name, email, password, role) VALUES
('John Doe', 'john.doe@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER'),
('Jane Smith', 'jane.smith@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER'),
('Robert Johnson', 'robert.j@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER'),
('Emily Davis', 'emily.d@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER'),
('Michael Wilson', 'michael.w@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'USER');

-- Insert sample orders
INSERT INTO orders (user_id, total_amount, order_status) VALUES
(1, 27.98, 'Delivered'),
(1, 15.99, 'Shipped'),
(2, 32.97, 'Processing'),
(2, 18.99, 'Delivered'),
(3, 42.98, 'Pending'),
(4, 14.99, 'Delivered'),
(5, 25.98, 'Processing');

-- Insert sample order items
INSERT INTO order_items (order_id, book_id, quantity, price) VALUES
(1, 1, 1, 12.99),
(1, 2, 1, 14.99),
(2, 3, 1, 15.99),
(3, 4, 2, 16.485),
(4, 5, 1, 18.99),
(5, 6, 1, 24.99),
(5, 7, 1, 17.99),
(6, 2, 1, 14.99),
(7, 8, 1, 15.99),
(7, 9, 1, 10.00);

-- Insert sample cart items
INSERT INTO cart (user_id, book_id, quantity) VALUES
(1, 1, 1),
(1, 3, 2),
(2, 5, 1),
(3, 7, 3),
(4, 2, 1),
(5, 4, 2);

-- Insert sample payments
INSERT INTO payments (order_id, payment_method, payment_status, amount) VALUES
(1, 'Credit Card', 'Completed', 27.98),
(2, 'PayPal', 'Completed', 15.99),
(3, 'Credit Card', 'Processing', 32.97),
(4, 'Debit Card', 'Completed', 18.99),
(5, 'Credit Card', 'Pending', 42.98),
(6, 'PayPal', 'Completed', 14.99),
(7, 'Credit Card', 'Processing', 25.98);

-- Insert another admin user
INSERT INTO admin (username, password) VALUES ('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');