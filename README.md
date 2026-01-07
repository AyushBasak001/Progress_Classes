# Progress Classes

A demo full-stack web application built as my first complete full-stack project, showcasing the technologies I am comfortable working with on both backend and server-rendered frontend.

This project represents an educational institute website where public users can view information, and a single admin can manage all core data securely.

## 📌 Purpose of the Project

The goal of this project was to:

- Build a fully functional full-stack application from scratch
- Demonstrate my understanding of:
    - Backend development
    - Database design & relationships
    - Authentication & authorization
    - Server-side rendering
- Serve as a technology showcase, not a production product

## ✨ Features

### 🌐 Public Access (No Login Required)

- Anyone can access public sections
- View:
    - Courses offered
    - Faculties
    - Read and submit public enquiries
- Clean separation between public and admin routes

### 🔐 Admin Functionality

- Single admin authorization
- Secure admin authentication using:
    - Cookies
    - JWT (JSON Web Tokens)
    - bcrypt password hashing
- Admin can perform full CRUD operations on:
    - Courses
    - Faculties
    - Enquiries
- Admin can:
    - Manage course–faculty relationships
    - Change admin password
- All admin routes are protected

### 🧩 Database Design

- Many-to-Many relationship between:
    - Courses ↔ Faculties
- Relational integrity enforced at database level
- Structured schema for clarity and scalability

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js

### Frontend (Server-Rendered)
- EJS
- Built-in CSS
- Vanilla JavaScript

### Database
- PostgreSQL

### Authentication & Security
- JWT
- bcrypt
- Cookies

## 📁 Project Structure (High Level)

```
Progress_Classes/
├── routes/
├── controllers/
├── views/
├── public/
├── db/
│   ├── schema.sql
│   └── seed.sql
├── middleware/
├── app.js
├── package.json
└── README.md
```

## ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PG_USER=
PG_HOST=
PG_DATABASE=
PG_PASSWORD=
PG_PORT=
JWT_SECRET=
```

⚠️ **Do not commit your `.env` file.**

## 🗄️ Database Setup (PostgreSQL)

This project includes:
- `schema.sql` → table definitions
- `seed.sql` → sample data

### Steps

1. **Create the database**
     ```sql
     CREATE DATABASE progress_classes;
     ```

2. **Connect to it**
     ```sql
     \c progress_classes
     ```

3. **Load schema**
     ```sql
     \i schema.sql
     ```

4. **Insert sample data**
     ```sql
     \i seed.sql
     ```

Ensure database credentials match your `.env` file.

## ▶️ Running the Project

### Install dependencies
```bash
npm install
```

### Development mode
```bash
npm run dev
```
Uses nodemon

### Production mode
```bash
npm start
```

## 🔐 Admin Password Initialization (One-Time Setup)

This project uses single-admin authentication by design.
The admin credentials are not seeded automatically for security reasons.

An admin password must be initialized once using a CLI utility.

### 📄 Script Location
```bash
utils/initAdmin.js
```

This script:

Accepts a plain password as a CLI argument

Hashes it using bcrypt

Stores the hash in the admin_auth table

Enforces single-admin behavior using a fixed primary key

### ▶️ How to Initialize Admin Password

⚠️ Run this only once (both locally or after deployment)

1. Ensure your `.env` is correctly set up with DB credentials.

For cloud databases (e.g., Render), SSL is required and is already handled in the script.

2. Run the script from project root
```bash
node utils/initAdmin.js YourStrongAdminPassword
```

Example:
```bash
node utils/initAdmin.js Admin@12345
```

Expected output:
```bash
✅ Admin password initialized
```

## 🚧 Limitations & Notes

- No user authentication (public access by design)
- Single admin only
- No payments or advanced scheduling
- Built strictly as a learning & demonstration project

## 📜 License

This project is intended for learning and demonstration purposes.

## 👤 Author

**Ayush Basak**  
B.Tech, NIT Raipur
