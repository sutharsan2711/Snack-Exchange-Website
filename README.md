# Snack Exchange - Food Ordering Platform

A full-stack online food ordering and admin management platform.

## 🚀 Applications & Ports

| Component | Technology | Default URL / Port |
| :--- | :--- | :--- |
| **Backend API** | Node.js (Express.js) & TiDB / MySQL | `http://localhost:8085/api` |
| **Customer Web** | React (Vite) & Tailwind CSS | `http://localhost:5173/` |
| **Admin Panel** | React (Vite) & Tailwind CSS | `http://localhost:5174/` |
| **Staff Mobile POS** | React (Vite) & Tailwind CSS (Mobile PWA) | `http://localhost:5175/` |

---

## 📁 Project Structure

```
Snack-Exchange-Website/
├── backend/          # Express.js REST API, TiDB/MySQL Connection & Routes
├── customer-web/     # Customer ordering portal (Menu, Cart, Checkout, Login, My Orders)
├── admin-panel/      # Restaurant Admin Panel (Menu, Orders, Analytics, Store Settings)
└── staff-pos/        # Mobile POS for shop staff & waiters (Tables, Fast Punch, Receipts, Shift Register)
```

---

## 🛠️ How to Run Locally

### 1. Backend (Express.js)
Ensure MySQL (or TiDB) is configured in `backend/.env`.

```bash
cd backend
npm install
npm start
```

### 2. Customer Web Application
```bash
cd customer-web
npm install
npm run dev
```

### 3. Admin Management Panel
```bash
cd admin-panel
npm install
npm run dev
```

### 4. Staff Mobile POS
```bash
cd staff-pos
npm install
npm run dev
```

---

## ✨ Features
* **Customer Web**: Food category browsing, Veg/Non-Veg filters, cart management, customer login, checkout, and live order tracking.
* **Admin Panel**: Static search header, scrollable menu & category tables, live order status controls (Accept/Dispatch/Cancel), and financial analytics reports.
* **Staff Mobile POS**: Mobile handheld terminal for waiters/staff, table selector, quick category filter, 1-tap cart drawer, thermal receipts, live kitchen statuses, and daily shift cash register balancing.

