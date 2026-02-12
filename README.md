# GymMini Backend



A robust, feature-rich backend API for **GymMini** - a modern, micro-SaaS gym management system. Built with Node.js, Express, and MongoDB, it powers real-time interactions, role-based access control, and comprehensive gym operations.

## 🌟 Key Features

### 👥 User Management
- **Role-Based Access Control (RBAC)**: Secure access for `Admin`, `Trainer`, and `Member` roles.
- **Authentication**: JWT-based secure login and registration.
- **OTP Verification**: Email-based OTP for password resets and verification.

### 🏋️ Gym Operations
- **Member Management**: Complete CRUD operations for gym members with search and filtering.
- **Staff Management**: Manage Trainers and Employees (Receptionists, Cleaners, etc.).
- **Session/Class Scheduling**: Schedule and manage gym classes with capacity limits.
- **Attendance Tracking**:
    - **Members**: Track attendance for classes and general gym visits.
    - **Staff**: Daily attendance logging for trainers and employees.

### 🥗 Wellness & Plans
- **Diet Plans**: Trainers can assign personalized diet plans to members.
- **Workout Plans**: Custom workout routines created by trainers for members.

### 💬 Engagement & Analytics
- **Feedback System**: Members can rate trainers and classes.
- **Real-Time Notifications**: Powered by `Socket.io` for instant updates on feedback and assignments.
- **Dashboard Analytics**: detailed insights on members, revenue, and attendance trends.

## 🛠️ Technology Stack

- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (Mongoose ODM)
- **Authentication**: JWT, bcryptjs
- **Validation**: [Zod](https://zod.dev/) & express-validator
- **Real-Time**: [Socket.io](https://socket.io/)
- **Email Service**: Nodemailer
- **Environment**: Dotenv

## 📂 Project Structure

```bash
gym-backend/
├── config/          # Database connection logic
├── controllers/     # Application logic (the "Brain")
├── middleware/      # Auth checks, validation, error handling
├── models/          # Mongoose database schemas
├── routes/          # API endpoint definitions
├── utils/           # Helper functions (Email, Socket, Seeding)
├── validators/      # Zod/Express validators
└── server.js        # Entry point
```

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (Local instance or Atlas URI)
- **npm** or **yarn**

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/gym-backend.git
    cd gym-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root directory (copy from `.env.example`):
    ```bash
    cp .env.example .env
    ```
    Update the values in `.env`:
    ```env
    PORT=5000
    NODE_ENV=development
    MONGODB_URI=mongodb://localhost:27017/gymmini # Or your Atlas URI
    JWT_SECRET=your_super_secure_secret
    JWT_EXPIRES_IN=7d
    
    # Admin Seed Credentials
    ADMIN_EMAIL=admin@gymmini.com
    ADMIN_PASSWORD=admin123

    # Email Service (Gmail Example)
    EMAIL_SERVICE=gmail
    EMAIL_USER=your-email@gmail.com
    EMAIL_PASSWORD=your-app-specific-password
    ```

4.  **Seed Database (Optional):**
    Create an initial Admin account:
    ```bash
    npm run seed
    ```

### Running the Server

-   **Development Mode** (with Nodemon):
    ```bash
    npm run dev
    ```
-   **Production Mode**:
    ```bash
    npm start
    ```

Server will run on `http://localhost:5000` by default.

## 📚 API Documentation

Base URL: `/api`

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | User login (returns JWT) |
| `POST` | `/forgot-password` | Request password reset OTP |
| `POST` | `/reset-password` | Reset password using OTP |

### 👤 Members (`/api/members`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Admin/Trainer | Get all members (supports query params) |
| `POST` | `/` | Admin | Create a new member |
| `GET` | `/:id` | Admin/Trainer/Owner | Get specific member details |
| `PUT` | `/:id` | Admin | Update member details |
| `DELETE` | `/:id` | Admin | Delete a member |

### 🏋️ Sessions (`/api/sessions`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Auth Users | List all gym sessions |
| `POST` | `/` | Admin/Trainer | Create a new session |
| `PUT` | `/:id` | Admin/Trainer | Update session details |
| `PUT` | `/:id/cancel` | Admin/Trainer | Cancel a session |

### 📝 Attendance (`/api/attendance`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Admin/Trainer | Mark member attendance |
| `GET` | `/session/:id` | Auth Users | Get attendance list for a session |

### 📊 Dashboard (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/stats` | Admin | Get high-level gym statistics |
| `GET` | `/chart-data` | Admin | Get data for dashboard charts |

### 👔 Employees & Trainers
- **Employees**: `/api/employees` - CRUD for gym staff.
- **Trainers**: `/api/trainers` - CRUD for trainers.
- **Staff Attendance**: `/api/employee-attendance` - Track staff check-ins.

### 🥗 Health Plans
- **Diet Plans**: `/api/diet-plans` - Assign/View diet plans.
- **Workout Plans**: `/api/workout-plans` - Assign/View workout routines.

### 💬 Feedback (`/api/feedback`)
- `POST /` - Submit feedback for a class or trainer.
- `GET /` - View feedback (filtered by role).

## ⚡ Socket.io Events

The backend emits real-time events for live updates:

| Event Name | emitted To | Description |
| :--- | :--- | :--- |
| `new_feedback` | Specific Trainer | Notification when a trainer receives feedback. |
| `new_class_feedback` | All (Admins) | Notification when a class receives feedback. |
| `join` | Server | Client event to join a user-specific room. |

## 🧪 Testing

You can test the API using Postman or cURL.
There are helpful markdown guides included in this repo for specific flows:
- `POSTMAN_GUIDE.md`
- `EMAIL_SETUP_GUIDE.md`
- `ROLE_BASED_AUTH.md`
>>>>>>> e8f904f0753b16672dc438df8bbb41b5587f12f1

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

This project is licensed under the ISC License.
