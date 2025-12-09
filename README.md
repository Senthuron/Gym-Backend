# GymMini Backend

A complete backend API for GymMini - a micro-SaaS gym management system.

## 🎯 Features

- **Role-Based Authentication**: User registration and login with admin/user roles
- **Member Management**: Full CRUD operations with search and filtering
- **Session Scheduling**: Create and manage gym classes/sessions
- **Attendance Tracking**: Mark and track member attendance
- **Dashboard Analytics**: Real-time statistics and insights
- **Secure Access Control**: JWT-based authentication with role-based permissions

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- MongoDB (running locally or remote)

### Installation

1. **Clone and install**:
   ```bash
   cd gym-backend
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   ```

3. **Seed admin user**:
   ```bash
   npm run seed
   ```

4. **Start server**:
   ```bash
   npm run dev  # Development mode
   npm start    # Production mode
   ```

Server runs on `http://localhost:5000`

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🔑 Default Credentials

**Admin Account**:
- **Email**: `admin@gymmini.com`
- **Password**: `admin123`
- **Role**: `admin`

**Test User Account**:
- **Email**: `user@gymmini.com`
- **Password**: `user123`
- **Role**: `user`

⚠️ Change these passwords after first login!

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (admin or user)
- `POST /api/auth/login` - Login (admin or user)

### Members
- `GET /api/members` - List members (with search/filter)
- `POST /api/members` - Create member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Sessions
- `GET /api/sessions` - List sessions (with filters)
- `POST /api/sessions` - Create session
- `PUT /api/sessions/:id` - Update session
- `PUT /api/sessions/:id/cancel` - Cancel session

### Attendance
- `POST /api/attendance` - Mark attendance
- `GET /api/attendance/session/:id` - Get session attendance

### Dashboard
- `GET /api/dashboard/stats` - Get analytics

## 🗄️ Database Schema

### Collections
- **Admin**: Authentication
- **Member**: Member profiles and membership tracking
- **Session**: Class/session scheduling
- **Attendance**: Attendance records

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator

## 📁 Project Structure

```
gym-backend/
├── config/          # Database configuration
├── controllers/     # Business logic
├── middleware/      # Authentication & validation
├── models/          # Mongoose schemas
├── routes/          # API routes
├── utils/           # Helper scripts
└── server.js        # Entry point
```

## 🧪 Testing

Use the provided cURL examples in [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) or tools like Postman/Insomnia.

## 📝 Environment Variables

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gymmini
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=admin@gymmini.com
ADMIN_PASSWORD=admin123
```

## 🤝 Frontend Integration

This backend is designed to work with the GymMini frontend (React/Next.js). All protected routes require the JWT token in the Authorization header:

```javascript
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

## 📊 Dashboard Metrics

The dashboard provides:
- Active members count
- Expiring memberships (within 7 days)
- Weekly classes count
- Attendance percentage

## 🔒 Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Protected routes with middleware
- Input validation on all endpoints

## 📄 License

ISC

---

Built with ❤️ for GymMini
