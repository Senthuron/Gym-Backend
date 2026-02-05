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

## 📄 License

This project is licensed under the ISC License.
