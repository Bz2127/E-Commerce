# 🇪🇹 E-Commerce Marketplace (Ethiopia)

## 📁 Repository Overview
This project is a full-stack marketplace designed for the Ethiopian market, featuring **Chapa Payment Gateway** integration and a secure **MVC architecture**.

### 🛠️ Architecture
- **Backend**: Node.js/Express with MySQL.
- **Frontend**: React.js with Context API for State Management.
- **Security**: JWT Authentication, Helmet, and Rate Limiting.

### 🗄️ Database Structure (MySQL)
The project uses a relational database with the following key tables:
- `users`: Managed via `auth.controller.js` (RBAC: Admin, Seller, Customer).
- `products`: Managed via `product.controller.js` with image handling.
- `orders`: Integrated with `payment.controller.js` for Chapa Webhooks.

### 🌐 Live Demo
- **Frontend**: [Link to Vercel]
- **Backend API**: [Link to Render]