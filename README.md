# GymMini Backend

A complete backend API for **GymMini** – a micro-SaaS gym management system for gyms and fitness centers.

This service provides user management, membership tracking, class/session scheduling, attendance, dashboards, trainers and employees, diet/workout plans, feedback collection, real-time updates, and email-based flows (including password reset).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture & Project Structure](#architecture--project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Database Seeding](#database-seeding)
  - [Running the Server](#running-the-server)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Authentication & Authorization](#authentication--authorization)
- [Data Models Overview](#data-models-overview)
- [Real‑Time Features (Socket.io)](#real-time-features-socketio)
- [Email & Password Reset](#email--password-reset)
- [Testing & API Exploration](#testing--api-exploration)
- [Contributing & Conventions](#contributing--conventions)
- [License](#license)

---

## Features

- **Role-Based Authentication & Authorization**
  - JWT-based login and protected routes.
  - Roles: `admin`, `trainer`, `member` (and internal `employee` model).
  - Middleware-based access control (admin-only, trainer-only, member-only).

- **User, Member, Trainer & Employee Management**
  - CRUD for members, trainers, and employees.
  - Separate profile and role handling via shared `User` model.
  - Search and filtering for members and sessions.

- **Session & Class Scheduling**
  - Create, update, cancel gym classes/sessions.
  - Filter sessions (by trainer, date, status, etc.).

- **Attendance Tracking**
  - Member attendance per session.
  - Employee attendance with dedicated model and routes.

- **Diet & Workout Plans**
  - Manage diet plans and workout plans assigned to members.

- **Feedback System**
  - Collect feedback from users/members for the gym or services.

- **Dashboard & Analytics**
  - Key dashboard stats for admins.
  - Metrics such as active members, expiring memberships, weekly sessions, and attendance summaries.

- **Email Integration**
  - OTP and password reset emails.
  - Sending credentials and important notifications.

- **Real-Time Communication (Socket.io)**
  - Socket.io server initialized alongside HTTP server.
  - User-specific rooms and broadcasting capabilities.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with **Mongoose** ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**:
  - **Zod** (primary) – via centralized validators.
  - `express-validator` (legacy, used in some endpoints).
- **Real-Time**: Socket.io
- **Email**: Nodemailer
- **Config & Environment**: dotenv
- **CORS**: cors
- **Development**: nodemon

All versions and scripts are defined in `package.json`.

---

## Architecture & Project Structure

The codebase follows a clear **MVC-style** layout with dedicated layers for models, controllers, routes, middleware, validation, and utilities.

```bash
gym-backend/
├── config/              # Database and email configuration
├── controllers/         # Business logic (auth, members, sessions, dashboards, etc.)
├── middleware/          # Auth & validation middleware
├── models/              # Mongoose schemas (User, Member, Trainer, etc.)
├── routes/              # Express route definitions
├── utils/               # Utility scripts (seeding, email, socket, migrations)
├── validators/          # Zod-based validation schemas
├── .env.example         # Example env configuration
└── server.js            # Application entry point
```

- **`server.js`**
  - Loads environment variables.
  - Connects to MongoDB (`config/database.js`).
  - Sets up Express, CORS, JSON parsing.
  - Registers all route modules under `/api`.
  - Initializes Socket.io and binds it to the HTTP server.

- **`config/`**
  - `database.js`: Central MongoDB connection based on `MONGODB_URI`.
  - `email.js`: Nodemailer transporter configured via environment variables.

- **`controllers/`**
  - `authController`, `memberController`, `sessionController`, `attendanceController`,
    `dashboardController`, `trainerController`, `userController`, `employeeController`,
    `employeeAttendanceController`, `dietPlanController`, `workoutPlanController`,
    `feedbackController`, etc.

- **`models/`**
  - `User`, `Admin`, `Member`, `Trainer`, `Employee`,
    `Session`, `Attendance`, `EmployeeAttendance`,
    `DietPlan`, `WorkoutPlan`, `Feedback`, `OTP`.

- **`middleware/`**
  - `auth.js`: JWT verification and role-based guards.
  - `validate.js`: Zod-based request validation integration.

- **`validators/`**
  - Zod schemas for auth, members, sessions, trainers, etc.

- **`utils/`**
  - `seedAdmin.js`: Creates default admin and test user accounts.
  - `sendEmail.js`: Helper to send emails using Nodemailer.
  - `socket.js`: Socket.io initialization and event handling.
  - `migrateToUsers.js`: Migration utility (see `USER_STORAGE_FIX.md`).

---

## Getting Started

### Prerequisites

- **Node.js** v14+ (LTS recommended).
- **MongoDB** (local instance or remote cluster).

### Installation

```bash
git clone <your-repo-url>
cd Gym-Backend
npm install
```

> Adjust the folder name/path as appropriate if your local directory differs.

### Environment Configuration

1. Create a new `.env` file from the example:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` and set values for:
   - MongoDB URI (`MONGODB_URI`)
   - JWT secret (`JWT_SECRET`)
   - Email credentials (`EMAIL_SERVICE`, `EMAIL_USER`, `EMAIL_PASSWORD`)
   - Allowed frontend origins (`FRONTEND_URL`)
   - Any other environment variables described below.

### Database Seeding

To create a default admin and test user:

```bash
npm run seed
```

This uses the values from your `.env` (see **Default Credentials** below).

### Running the Server

**Development mode** (with auto-reload via nodemon):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

By default the server listens on:

```text
http://localhost:5000
```

You can change the port via the `PORT` environment variable.

---

## Environment Variables

All configuration is driven via `.env`. Use `.env.example` as a template.

Common variables include:

```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/gymmini

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Default seed users
ADMIN_EMAIL=admin@gymmini.com
ADMIN_PASSWORD=admin123

# Email / SMTP
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_app_password

# Frontend integration / CORS
FRONTEND_URL=http://localhost:3000,http://localhost:3001
```

> Only set the values you actually use. Refer to `EMAIL_SETUP_GUIDE.md` and `.env.example` for the full set and details.

---

## API Overview

- **Base URL**: `http://localhost:5000/api`

Core route groups:

- **Auth** – `/api/auth`
  - Login, registration, logout.
  - OTP-based password reset flow.

- **Members** – `/api/members`
  - CRUD for gym members.
  - Searching and filtering.

- **Trainers** – `/api/trainers`
  - CRUD operations for trainers and related info.

- **Users** – `/api/users`
  - Generic user management (across roles).

- **Sessions** – `/api/sessions`
  - Create/update sessions.
  - Cancel sessions.
  - Filter by trainer, date, etc.

- **Attendance** – `/api/attendance`
  - Member attendance for sessions.

- **Employee Attendance** – `/api/employee-attendance`
  - Track and manage employee attendance.

- **Employees** – `/api/employees`
  - Employee records management.

- **Diet Plans** – `/api/diet-plans`
  - CRUD for diet plans.

- **Workout Plans** – `/api/workout-plans`
  - CRUD for workout plans.

- **Feedback** – `/api/feedback`
  - Submit and manage user feedback.

- **Dashboard** – `/api/dashboard`
  - Aggregated stats and analytics for dashboards.

For detailed endpoint-by-endpoint usage, see:

- `ROLE_BASED_AUTH.md` – Detailed explanation of authentication/authorization and role-based access.
- `PASSWORD_RESET_API.md` – Password reset and OTP API contract.
- `POSTMAN_GUIDE.md` – How to import and use Postman collections for this API.
- `EMAIL_SETUP_GUIDE.md` – Email configuration and common gotchas.
- `USER_STORAGE_FIX.md` – Notes on user storage migration.

---

## Authentication & Authorization

This backend uses **JWT** for stateless authentication and middleware for route protection.

- **Token format**: `Authorization: Bearer <token>`
- **Creation**: JWT issued during login; includes user ID and role.
- **Verification**: `authenticateToken` middleware validates token and attaches the user to `req.user`.

**Role Guards** (from `middleware/auth.js`):

- `requireAdmin` – Only admins can access.
- `requireTrainer` – Trainers and admins.
- `requireMember` – Members and admins.

### Default Credentials

After running `npm run seed`, the following default accounts are typically created (depending on your `.env`):

- **Admin Account**
  - Email: `admin@gymmini.com`
  - Password: `admin123`
  - Role: `admin`

- **Test User Account**
  - Email: `user@gymmini.com`
  - Password: `user123`
  - Role: `user` (or member-equivalent)

> ⚠️ For security, **change these passwords immediately** in any non-local environment.

---

## Data Models Overview

Main Mongoose models:

- **User**
  - Core authentication entity.
  - Stores credentials, role, and common user properties.
  - Passwords are hashed via a pre-save hook (bcryptjs).

- **Admin / Member / Trainer / Employee**
  - Role-specific profile collections.
  - Extend the base user concept with domain-specific fields.

- **Session**
  - Represents gym classes/sessions.
  - Links to trainer, time, capacity, etc.

- **Attendance**
  - Member attendance records per session.

- **EmployeeAttendance**
  - Attendance tracking specifically for employees.

- **DietPlan / WorkoutPlan**
  - Personalized plans for members.

- **Feedback**
  - Feedback items with rating, comments, and metadata.

- **OTP**
  - One-time passwords for password reset.
  - Includes expiration logic and validation.

---

## Real-Time Features (Socket.io)

The server initializes a **Socket.io** instance (see `utils/socket.js`) and attaches it to the HTTP server in `server.js`.

- Each connected user can join rooms for targeted events.
- Supports broadcasting and room-based messaging.
- CORS is permissive during development; restrict origins for production using environment configuration.

---

## Email & Password Reset

Email functionality is powered by **Nodemailer**, configured via `config/email.js`.

- Used for:
  - Sending password reset OTPs.
  - Sending credentials or notifications.

The **password reset flow** is fully documented in `PASSWORD_RESET_API.md` and typically includes:

1. **Request reset**: User submits email, receives OTP.
2. **Verify OTP**: User verifies OTP within a limited time window.
3. **Reset password**: User sets a new password using the verified OTP.

Configure your email provider and credentials as described in `EMAIL_SETUP_GUIDE.md`.

---

## Testing & API Exploration

There is no automated test suite configured (no Jest/Mocha files). Manual/API testing is recommended.

- Use **Postman** (or similar tools like Insomnia) with the guidance in `POSTMAN_GUIDE.md`.
- You can also:
  - Use cURL commands from the markdown docs.
  - Explore endpoints with any REST client (ensuring JWT is sent in the `Authorization` header).

Recommended future improvement:

- Add a proper test suite (e.g. Jest + supertest).
- Add ESLint + Prettier for consistent code quality.

---

## Contributing & Conventions

- **Code Style**
  - Standard JavaScript (CommonJS modules).
  - MVC separation: controllers ↔ models ↔ routes.
  - Prefer `async/await` with try/catch in controllers.
  - Centralized validation using Zod schemas in `validators/`.

- **Commits & Tooling**
  - No enforced commit hooks at the moment.
  - Consider adding lint/test steps before commits in your workflow.

If you add new modules:

- Place business logic in `controllers/`.
- Define request validation in `validators/`.
- Wire new endpoints in `routes/`.
- Add or update Mongoose schemas in `models/`.

---

## License

ISC

---

Built with ❤️ for GymMini
