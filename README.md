# Solace Studio - E-Commerce Platform

A modern, feature-rich full-stack E-Commerce web application built using **React 19**, **Redux Toolkit**, **Vite**, **Tailwind CSS v4**, **Node.js**, **Express v5**, **MongoDB**, **Google Gemini AI**, **ImageKit**, and **Razorpay**.

---

## 🚀 Features

### 🤖 Kairis AI Natural-Language Shopping Search
- **AI-Powered Intent Extraction**: Uses **Google Gemini 2.0 Flash** (`gemini-2.0-flash`) to parse complex free-text search queries (e.g., *"black hoodie under ₹2000 that pairs with the Dash Force sneakers"*).
- **Smart Intent Filtering**:
  - **Category Mapping**: Normalizes shopper terms into standard categories (*Shirts, T-shirts, Jeans, Trousers, Cargo Pants, Shoes, Overshirt, Plus-Size, Shorts, Sunglasses, Perfumes*).
  - **Color & Budget Extraction**: Extracts color preferences (*Black, Sky Blue, Olive, Navy, etc.*) and price constraints (`maxPrice` and `minPrice`).
  - **Brand Detection & Prioritization**: Identifies explicit brand names (*e.g., Kyros, Nike*) and ranks matching products first.

---

### 👤 User Authentication & Authorization
- **JWT-Based Authentication**: Secure login and registration with HTTP-only cookies and token verification.
- **Google OAuth 2.0**: One-click social login integration using Passport.js.
- **Role-Based Access Control (RBAC)**: Distinct permissions for **Buyers/Customers** and **Sellers**.
- **Protected Routes**: Secure client-side page navigation based on user roles and authentication state.

---

### 🛒 Customer Features
- **Product Catalog & Home Page**: Browse products across various categories with modern grid layouts and instant AI search integration.
- **Product Details & Variant Selector**: Rich product view supporting size, color, pricing, and high-resolution variant image gallery.
- **Shopping Cart**: Add/remove products, adjust item quantities, select variants, and calculate total order price in real-time.
- **Wishlist Management**: Save favorite products to personal wishlist for future purchases.
- **Order History**: Track past orders with complete itemized order summaries and payment status.
- **Product Reviews & Ratings**: Submit ratings and customer feedback on purchased items.

---

### 🛍️ Seller Features & Analytics Dashboard
- **Seller Dashboard & Real-Time Analytics**:
  - Aggregated real-time metrics computed via MongoDB aggregation pipelines.
  - **Total Revenue**: Live calculation from paid transactions.
  - **Total Units Sold & Orders Count**: Multi-item order statistics.
  - **Best Seller Identification**: Auto-detection of top-performing items by sales volume.
- **Product Management (CRUD)**:
  - Add new products with title, description, category, base price, and labor cost breakdown.
  - **Variant Management**: Add size, color, stock, custom pricing, and variant-specific images.
  - **ImageKit Cloud Storage**: Multi-image uploads securely on ImageKit.
- **Isolated Multi-Seller Order Management**:
  - View incoming customer orders with itemized seller filtering (sellers only see their own items within multi-product orders).

---

### 💳 Payment Integration
- **Razorpay Payment Gateway**: Secure online payments supporting UPI, Debit/Credit cards, NetBanking, and Wallets.
- **Server-Side Order Verification**: Cryptographic payment signature verification to prevent fraudulent orders.
- **Payment Status Lifecycle**: Automated transaction updates (`pending`, `paid`, `failed`).

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 19 (Vite)
- **State Management**: Redux Toolkit & React-Redux
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4 & Vanilla CSS
- **HTTP Client**: Axios
- **Payments**: `react-razorpay`

### **Backend**
- **Runtime & Framework**: Node.js & Express.js (v5)
- **AI & NLP**: Google Gemini API 
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: `jsonwebtoken`, `bcryptjs`, `passport`, `passport-google-oauth20`
- **File & Media Storage**: ImageKit (`@imagekit/nodejs`) & `multer`
- **Payments**: Razorpay Node SDK (`razorpay`)
- **Validation & Middleware**: `express-validator`, `cors`, `cookie-parser`, `morgan`, `dotenv`

---

## 📁 Project Structure

```
Snitch/
├── Backend/
│   ├── src/
│   │   ├── config/          # DB, ImageKit, & Passport configs
│   │   ├── controllers/     # Auth, Cart, Order, Product, Review controllers
│   │   ├── dao/             # Data Access Objects
│   │   ├── middlewares/     # Auth, Role, & Error handling middlewares
│   │   ├── models/          # Mongoose Schemas (User, Product, Cart, Payment, Review)
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # AI Search Service, ImageKit Storage Service, Payment Service
│   │   └── validators/      # Request data validators
│   ├── server.js            # App entry point
│   ├── package.json
│   └── .env.example         # Environment variables template
│
└── Frontend/
    ├── src/
    │   ├── app/             # Store & Route definitions
    │   ├── features/        # Feature modules (auth, cart, orders, products, reviews, wishlist)
    │   ├── main.jsx         # App entry point
    │   └── App.css
    ├── index.html
    ├── vite.config.js
    └── package.json
```

