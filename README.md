# Library Management System (MERN Stack)

A complete, production-ready full-stack Library Management System built with **MongoDB**, **Express.js**, **React.js**, and **Node.js** as outlined in the academic and professional project model documentation.

---

## 🌟 Key Features

### 1. Dashboard (Module 4.1)
- Real-time statistics:
  - **Total Books** & catalog copy count
  - **Total Registered Members**
  - **Currently Issued Books**
  - **Returned Books History**
- Category breakdown visualization
- Recent circulation activities with 1-click quick-return action

### 2. Book Management (Module 4.2)
- Browse full catalog with search (title, author, ISBN) and category filters
- Add new book titles with stock quantity tracking
- Edit book details with automatic stock consistency validation
- Delete books with active loan protection
- Quick issue shortcut from book listing

### 3. Member Management (Module 4.3)
- Register library patrons with name, email, phone number, and membership date
- Search members directory
- Track active issued book count per member
- Member loan history inspection

### 4. Issue & Return System (Module 4.4)
- **Issue Book**:
  - Automatically verifies copy availability (`availableQuantity > 0`)
  - Decrements available quantity in real time
  - Prevents issuing when copies are out of stock
  - Prevents duplicate active issues of the same book to the same member
- **Return Book**:
  - 1-click return from Dashboard, Transactions, or Book views
  - Automatically increments book's available stock
  - Records timestamped return records

---

## 🏗️ Technology Stack

| Component | Technology | Description |
|-----------|------------|-------------|
| **Frontend** | React 18, Vite | Fast, responsive modern single-page application |
| **Icons** | Lucide React | Clean, intuitive user interface icons |
| **Backend** | Node.js, Express.js | RESTful API server with modular routing and controllers |
| **Database** | MongoDB & Mongoose | Document database with schema validation |
| **Zero-Config DB** | MongoMemoryServer | Built-in in-memory fallback for instant setup without local MongoDB required |

---

## 📁 Project Folder Structure

```
library-management-system/
├── client/                     # Frontend React Application
│   ├── src/
│   │   ├── components/         # Reusable UI Components (Navbar, StatCard, Modal)
│   │   ├── pages/              # Views (Dashboard, Books, Members, Issue, Transactions)
│   │   ├── services/           # Axios API services
│   │   ├── App.jsx             # Main Application router & state
│   │   ├── index.css           # Modern design styles
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/                     # Backend Node / Express Application
│   ├── config/
│   │   └── db.js               # Database connection & memory fallback
│   ├── controllers/            # Request handlers
│   │   ├── bookController.js
│   │   ├── memberController.js
│   │   ├── transactionController.js
│   │   └── dashboardController.js
│   ├── models/                 # Mongoose schemas
│   │   ├── Book.js
│   │   ├── Member.js
│   │   └── Transaction.js
│   ├── routes/                 # Express API routes
│   │   ├── bookRoutes.js
│   │   ├── memberRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── dashboardRoutes.js
│   ├── seed.js                 # Initial realistic library dataset
│   ├── server.js               # Server entry point
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### Step 1: Clone or Navigate to Project
```bash
cd library-management-system
```

### Step 2: Install Dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 3: Run the Application

#### Option A: Unified Full-Stack Run (Recommended)
1. Build the React frontend:
   ```bash
   cd client
   npm run build
   ```
2. Start the Express server:
   ```bash
   cd ../server
   npm start
   ```
3. Open your browser at: **`http://localhost:5000`**
*(The Express server serves both the REST API and the React frontend on port 5000).*

#### Option B: Independent Development Mode
- **Backend**: `cd server && npm run dev` (Runs on `http://localhost:5000`)
- **Frontend**: `cd client && npm run dev` (Runs on `http://localhost:3000` with API proxying)

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard` | Summary statistics & recent transactions |
| `GET` | `/api/books` | Get all books (supports `?search=` and `?category=`) |
| `POST` | `/api/books` | Add a new book title |
| `GET` | `/api/books/:id` | Get book details by ID |
| `PUT` | `/api/books/:id` | Update book details and quantity |
| `DELETE` | `/api/books/:id` | Remove a book |
| `GET` | `/api/members` | Get all members with active loan counts |
| `POST` | `/api/members` | Register a new member |
| `GET` | `/api/members/:id` | Get single member and loan history |
| `PUT` | `/api/members/:id` | Update member information |
| `DELETE` | `/api/members/:id` | Delete member |
| `GET` | `/api/transactions` | Get transactions (supports `?status=issued\|returned`) |
| `POST` | `/api/transactions/issue` | Issue a book to a member |
| `PUT` | `/api/transactions/:id/return` | Mark an issued book as returned |
