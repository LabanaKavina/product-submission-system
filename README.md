# Product Submission System

A full-stack web application for role-based product submission and review. Users submit products with multiple variants (images, name, price) for admin review. Admins can approve or reject submissions from a dedicated dashboard.

---

## Table of Contents

- [Project Description](#project-description)
- [Assumptions](#assumptions)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Setup — Docker (recommended)](#setup--docker-recommended)
- [Setup — Manual (without Docker)](#setup--manual-without-docker)
- [Default Credentials](#default-credentials)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)

---

## Project Description

The system has two roles:

- **User** — can register/login, submit products with one or more variants, view their own submissions, edit or delete products that are still in `Submitted` status, and track approval status.
- **Admin** — can view all submitted products across all users, approve or reject them, and filter/sort the list.

Each product has:
- A name (unique per user)
- A description
- One or more **variants**, each with a name, price (INR), and an image (JPEG/PNG/WebP)

Products go through three statuses: `Submitted` → `Approved` or `Rejected`.

---

## Assumptions

1. **Authentication is login-only** — there is no public registration UI. Two seed users are created automatically (see [Default Credentials](#default-credentials)).
2. **Product name uniqueness is per-user**, not global. Two different users can have products with the same name.
3. **Only `Submitted` products can be edited or deleted** by the user. Approved/rejected products are locked.
4. **Images are stored locally** in `backend/uploads/`. No cloud storage is configured.
5. **Prices are in INR (₹)**. The frontend formats all prices using the `en-IN` locale.
6. **Soft deletes** are used for products — deleted products are not permanently removed from the database.
7. **JWT tokens expire after 24 hours** by default.
8. The application is **not production-ready** — it uses development secrets, has no HTTPS, and no rate limiting.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js 18, TypeScript, Express.js |
| Database | MySQL 8.0, Sequelize ORM |
| Auth | JWT (jsonwebtoken + bcrypt) |
| Validation | Joi |
| File uploads | Multer (local disk storage) |
| Frontend | React 18, TypeScript, React Router v6 |
| Styling | Tailwind CSS |
| State | React Context API + native Fetch |
| Infrastructure | Docker, Docker Compose |

---

## Features

- JWT authentication with role-based access control (User / Admin)
- Product creation with multiple variants (name, price, image)
- Per-user unique product name validation
- Product edit and soft-delete (Submitted status only)
- Admin product list with search, filter by status, and sort
- Approve / Reject workflow for admins
- Lightweight list API responses (only required fields fetched)
- Sticky header + filter bar + pagination footer on list pages
- INR currency formatting throughout
- Scroll-to-top on route change
- Responsive layout with mobile drawer navigation

---

## Project Structure

```
product-submission-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and JWT config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/       # Auth, validation, upload, error handler
│   │   ├── migrations/      # Sequelize migrations
│   │   ├── models/          # Sequelize models (User, Product, Variant)
│   │   ├── routes/          # Express routers
│   │   ├── seeders/         # Default user seed
│   │   ├── services/        # Business logic
│   │   ├── types/           # TypeScript type extensions
│   │   ├── utils/           # AppError class
│   │   ├── validators/      # Joi schemas
│   │   ├── app.ts           # Express app setup
│   │   └── server.ts        # Entry point
│   ├── uploads/             # Uploaded variant images
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/       # ProductList, ProductReview
│   │   │   ├── auth/        # Login
│   │   │   ├── common/      # Layout, VariantEditor, PageStatus, Pagination, ScrollToTop
│   │   │   ├── ui/          # Button, Input, Textarea, Card, Badge, Modal, Spinner
│   │   │   └── user/        # MyProducts, ProductCard, ProductDetail, ProductForm, EditProduct
│   │   ├── context/         # AuthContext
│   │   ├── hooks/           # useDebounce
│   │   ├── services/        # api.ts (fetch wrapper)
│   │   ├── types/           # product.ts, auth.ts, api.ts, form.ts
│   │   └── utils/           # constants.ts, image.ts, validation.ts
│   ├── .env.example
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Setup — Docker (recommended)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running

```bash
# 1. Clone the repository
git clone <repository-url>
cd product-submission-system

# 2. Start all services (MySQL + backend + frontend)
docker-compose up
```

> **No `.env` file needed.** All environment variables have working defaults built into `docker-compose.yml`. The app runs out of the box.

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| MySQL | localhost:3307 |

On first run, Docker will:
1. Pull the MySQL 8.0 image and build the backend/frontend images
2. Wait for MySQL to be healthy, then run migrations and seed default users automatically
3. Start all three services with hot-reload enabled

> **First startup takes 1–2 minutes** while MySQL initialises. If the backend exits early, run `docker-compose up` again — MySQL will already be ready the second time.

To stop: `docker-compose down`  
To wipe all data and start fresh: `docker-compose down -v`

---

## Setup — Manual (without Docker)

> **You must set up a local MySQL database and create `.env` files before running anything.** The app will not start without a valid database connection and environment configuration.

### Prerequisites
- Node.js 18.x or higher
- MySQL 8.0 or 5.7 installed and running locally
- npm

### 1. Create the database

Connect to MySQL and run:

```sql
CREATE DATABASE product_submission_db;
CREATE USER 'appuser'@'localhost' IDENTIFIED BY 'apppassword';
GRANT ALL PRIVILEGES ON product_submission_db.* TO 'appuser'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Backend — create `.env` and run migrations

```bash
cd backend

# Install dependencies
npm install

# Create the env file from the template
cp .env.example .env
```

Open `backend/.env` and set the database values to match your local MySQL setup:

```env
NODE_ENV=development
PORT=5000
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=product_submission_db
DATABASE_USER=appuser
DATABASE_PASSWORD=apppassword
JWT_SECRET=any-long-random-string
JWT_EXPIRATION=24h
```

Then run migrations and seed:

```bash
# Create the tables
npm run migrate

# Seed default admin and user accounts
npm run seed

# Start the development server
npm run dev
```

Backend runs on `http://localhost:5000`.

### 3. Frontend — create `.env` and start

```bash
cd frontend

# Install dependencies
npm install

# Create the env file from the template
cp .env.example .env
```

Open `frontend/.env` and confirm the API URL points to your backend:

```env
REACT_APP_API_URL=http://localhost:5000
```

Then start the app:

```bash
npm start
```

Frontend runs on `http://localhost:3000`.

---

## Default Credentials

These are created automatically by the seeder.

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | admin123 |
| User | user@example.com | user123 |

---

## Environment Variables

### Root `.env` (Docker Compose)

| Variable | Default | Description |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | `rootpassword` | MySQL root password |
| `MYSQL_DATABASE` | `product_submission_db` | Database name |
| `MYSQL_USER` | `appuser` | Database user |
| `MYSQL_PASSWORD` | `apppassword` | Database password |
| `MYSQL_PORT` | `3307` | Host port for MySQL |
| `BACKEND_PORT` | `5000` | Host port for backend |
| `FRONTEND_PORT` | `3000` | Host port for frontend |
| `JWT_SECRET` | *(change this)* | JWT signing secret |
| `JWT_EXPIRATION` | `24h` | Token lifetime |
| `REACT_APP_API_URL` | `http://localhost:5000` | API base URL for frontend |

### `backend/.env`

| Variable | Description |
|---|---|
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 5000) |
| `DATABASE_HOST` | MySQL host |
| `DATABASE_PORT` | MySQL port |
| `DATABASE_NAME` | Database name |
| `DATABASE_USER` | Database user |
| `DATABASE_PASSWORD` | Database password |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRATION` | Token expiration (e.g. `24h`) |

### `frontend/.env`

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend base URL (e.g. `http://localhost:5000`) |

---

## API Documentation

A ready-to-import Postman collection is included in the repository root:

```
postman_collection.json
```

**How to import:**
1. Open Postman → click **Import**
2. Select `postman_collection.json`
3. The collection includes a `baseUrl` variable (default: `http://localhost:5000`) and a `token` variable
4. Run **Login as User** or **Login as Admin** first — the token is saved automatically to the collection variable and used by all subsequent requests

---

The full API reference is also documented below.

Base URL: `http://localhost:5000`

All protected routes require the header:
```
Authorization: Bearer <token>
```

---

### Auth

#### POST `/api/auth/login`
Authenticate and receive a JWT.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "user123"
}
```

**Response `200`:**
```json
{
  "token": "<jwt>",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "User"
  }
}
```

---

### Products (User)

#### GET `/api/products/my`
Get the authenticated user's products (paginated, lightweight list).

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `search` | string | Filter by product name |
| `status` | string | Filter by status (`Submitted`, `Approved`, `Rejected`) |

**Response `200`:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Classic Tee",
      "status": "Submitted",
      "createdAt": "2026-06-23T10:00:00.000Z",
      "variantCount": 2,
      "coverImagePath": "uploads/images-xxx.png"
    }
  ],
  "pagination": {
    "total": 11,
    "page": 1,
    "limit": 10,
    "totalPages": 2
  }
}
```

---

#### POST `/api/products`
Create a new product with variants. Multipart form data.

**Form fields:**

| Field | Type | Description |
|---|---|---|
| `name` | string | Product name (unique per user, max 255) |
| `description` | string | Product description (max 2000) |
| `variants[0][name]` | string | Variant name |
| `variants[0][price]` | number | Variant price (positive) |
| `images` | file | Image file for each variant (JPEG/PNG/WebP), in order |

**Response `201`:** Full product with variants.

---

#### GET `/api/products/:id`
Get a single product with all variants. Users can only access their own products; admins can access any.

**Response `200`:**
```json
{
  "id": 1,
  "userId": 2,
  "name": "Classic Tee",
  "description": "...",
  "status": "Submitted",
  "createdAt": "...",
  "updatedAt": "...",
  "variants": [
    {
      "id": 5,
      "productId": 1,
      "name": "Red / Large",
      "price": 1200.00,
      "imagePath": "uploads/images-xxx.png",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

---

#### PUT `/api/products/:id`
Update a product. Only allowed when status is `Submitted`. Multipart form data.

Same fields as POST. For variants keeping an existing image, pass `variants[0][existingImagePath]` instead of a new file.

**Response `200`:** Updated product with variants.

---

#### DELETE `/api/products/:id`
Soft-delete a product (sets `deletedAt`). Only the owner can delete.

**Response `204`:** No content.

---

### Products (Admin)

#### GET `/api/admin/products`
Get all products across all users (paginated).

**Query params:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `search` | string | Filter by product name |
| `status` | string | Filter by status |
| `sortBy` | string | `name`, `status`, or `createdAt` (default: `createdAt`) |
| `order` | string | `ASC` or `DESC` (default: `DESC`) |

**Response `200`:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "Classic Tee",
      "status": "Submitted",
      "createdAt": "2026-06-23T10:00:00.000Z",
      "userEmail": "user@example.com",
      "variantCount": 2
    }
  ],
  "pagination": { "total": 11, "page": 1, "limit": 10, "totalPages": 2 }
}
```

---

#### PATCH `/api/admin/products/:id/review`
Approve or reject a product. Only works when current status is `Submitted`.

**Request body:**
```json
{
  "status": "Approved"
}
```

Accepted values: `"Approved"` or `"Rejected"`.

**Response `200`:** Updated product.

---

### Error Responses

All errors follow this shape:

```json
{
  "status": "error",
  "statusCode": 400,
  "message": "Descriptive error message"
}
```

| Code | Meaning |
|---|---|
| `400` | Validation error or business rule violation |
| `401` | Missing or invalid JWT |
| `403` | Authenticated but not authorised |
| `404` | Resource not found |
| `409` | Conflict (e.g. duplicate product name) |
| `500` | Unexpected server error |
