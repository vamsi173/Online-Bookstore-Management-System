# Online Book Store Management System

🎓 **MCA Final Project**

A full-stack web-based application developed using React (Frontend), Java (Backend), and MySQL (Database).

## 📋 Project Overview

This system allows users to browse, search, and purchase books online, while administrators manage books, users, orders, and payments. The project focuses on real-world e-commerce functionality, role-based authentication, secure data storage, and a visually attractive, animated UI.

## 🛠️ Technology Stack

### Frontend
- React JS
- JavaScript
- CSS (with animations & transitions)
- Framer Motion (for animations)
- React Router DOM
- Axios

### Backend
- Java (Spring Boot)
- REST APIs
- JWT-based Authentication
- Spring Security
- Spring Data JPA

### Database
- MySQL

## 👥 User Roles

### User
- Can register (Sign Up)
- Can log in (Sign In)
- Can browse & search books
- Can add books to cart
- Can place orders
- Can view order history

### Admin (Fixed Credentials)
- Username: `vamsi@admin.com`
- Password: `vamsi@123`
- Can add/update/delete books
- Can manage users
- Can view and manage orders
- Can monitor payments
- Can manage inventory

## 🗄️ Database Schema

The database includes the following tables:
- `users` - Stores user information
- `books` - Stores book details
- `cart` - Stores items in user carts
- `orders` - Stores order information
- `order_items` - Stores items within each order
- `payments` - Stores payment information
- `admin` - Stores admin credentials

## 🚀 Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher
- Node.js and npm
- MySQL Server

### Backend Setup
1. Navigate to the `backend` directory
2. Update the database configuration in `src/main/resources/application.properties`
3. Run the Spring Boot application using one of these methods:
   - Using Maven: `mvn spring-boot:run`
   - Using IDE: Import as Maven project in IntelliJ/Eclipse and run BookStoreApplication
   - Using JAR: `mvn clean package` then `java -jar target/online-book-store-0.0.1-SNAPSHOT.jar`

### Frontend Setup
1. Navigate to the `frontend` directory
2. Install dependencies: `npm install`
3. Start the development server: `npm start`

### Database Setup
1. Ensure MySQL server is running
2. Execute the SQL script in `database_schema.sql` using MySQL Workbench or command line
3. Update database credentials in `application.properties` if needed

### Running the Application
1. Start MySQL server
2. Run the backend: `mvn spring-boot:run`
3. In a new terminal, run the frontend: `cd frontend && npm start`
4. Access the application at `http://localhost:3000`

## 🎨 Features

- Modern colorful UI with animations
- Role-based authentication
- Secure JWT-based login system
- Shopping cart functionality
- Order management
- Search and filter books
- Responsive design for all devices
- Admin dashboard for managing the store

## 📁 Project Structure

```
Anudip Project/
├── backend/                    # Spring Boot Backend
│   ├── src/main/java/com/bookstore/
│   │   ├── controller/         # API Controllers
│   │   ├── model/             # Entity Models
│   │   ├── repository/        # Database Repositories
│   │   ├── security/          # Security Configuration
│   │   └── service/           # Business Logic
│   └── src/main/resources/
│       └── application.properties
├── frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable Components
│   │   ├── pages/            # Page Components
│   │   ├── services/         # API Services
│   │   └── animations/       # Animation Utilities
│   └── package.json
├── database_schema.sql        # Database Schema
└── README.md
```

## 🔐 Authentication Flow

1. User registers or logs in
2. Credentials are verified against the database
3. JWT token is generated upon successful login
4. Token is stored in localStorage
5. Subsequent requests include the token in headers
6. Backend validates the token for protected routes

## 📚 Core Modules

- **Home Page**: Animated hero section with featured books
- **User Registration**: Secure signup with password encryption
- **User Login**: Role-based authentication
- **Book Catalog**: Browse and search functionality
- **Shopping Cart**: Add/remove items with quantity management
- **Payment Module**: Order processing simulation
- **Order Management**: Track and manage orders

## 🎯 Project Objectives

- Understand full-stack development
- Learn React + Java integration
- Implement role-based authentication
- Work with relational databases
- Design professional UI/UX
- Simulate real-world e-commerce system

## 🚀 Admin Credentials

- **Username**: vamsi
- **Password**: vamsi@123

Use these credentials to access the admin dashboard after logging in.