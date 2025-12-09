# GymMini Backend API Documentation

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote)

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/gymmini
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=7d
   ADMIN_EMAIL=admin@gymmini.com
   ADMIN_PASSWORD=admin123
   ```

3. **Seed admin user**:
   ```bash
   npm run seed
   ```

4. **Start the server**:
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will run on `http://localhost:5000`

---

## 🔐 Authentication

All API routes except `/api/auth/login` require authentication via JWT token.

### Login

**POST** `/api/auth/login`

**Request Body**:
```json
{
  "email": "admin@gymmini.com",
  "password": "admin123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "admin": {
      "id": "507f1f77bcf86cd799439011",
      "email": "admin@gymmini.com",
      "role": "admin"
    }
  }
}
```

### Using the Token

Include the token in the `Authorization` header for all protected routes:

```
Authorization: Bearer <your_token_here>
```

---

## 👥 Member Management

### Get All Members

**GET** `/api/members`

**Query Parameters**:
- `search` (optional): Search by name or email
- `status` (optional): Filter by `active` or `expired`

**Example**:
```
GET /api/members?search=john&status=active
```

**Response**:
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "1234567890",
      "membershipStartDate": "2024-01-01T00:00:00.000Z",
      "membershipEndDate": "2024-12-31T00:00:00.000Z",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Member

**POST** `/api/members`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890",
  "membershipStartDate": "2024-01-01",
  "membershipEndDate": "2024-12-31"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Member created successfully",
  "data": { /* member object */ }
}
```

### Update Member

**PUT** `/api/members/:id`

**Request Body** (all fields optional):
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "phone": "0987654321",
  "membershipStartDate": "2024-01-01",
  "membershipEndDate": "2025-01-01"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Member updated successfully",
  "data": { /* updated member object */ }
}
```

### Delete Member

**DELETE** `/api/members/:id`

**Response**:
```json
{
  "success": true,
  "message": "Member deleted successfully"
}
```

---

## 📅 Session Management

### Get All Sessions

**GET** `/api/sessions`

**Query Parameters**:
- `startDate` (optional): Filter sessions from this date (YYYY-MM-DD)
- `endDate` (optional): Filter sessions until this date (YYYY-MM-DD)
- `status` (optional): Filter by `Scheduled`, `Cancelled`, or `Completed`

**Example**:
```
GET /api/sessions?startDate=2024-01-01&endDate=2024-01-31&status=Scheduled
```

**Response**:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Yoga Class",
      "trainer": "Jane Smith",
      "date": "2024-01-15T00:00:00.000Z",
      "startTime": "10:00",
      "capacity": 20,
      "status": "Scheduled",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Create Session

**POST** `/api/sessions`

**Request Body**:
```json
{
  "name": "Yoga Class",
  "trainer": "Jane Smith",
  "date": "2024-01-15",
  "startTime": "10:00",
  "capacity": 20
}
```

**Response**:
```json
{
  "success": true,
  "message": "Session created successfully",
  "data": { /* session object */ }
}
```

### Update Session

**PUT** `/api/sessions/:id`

**Request Body** (all fields optional):
```json
{
  "name": "Advanced Yoga",
  "trainer": "Jane Smith",
  "date": "2024-01-15",
  "startTime": "11:00",
  "capacity": 25,
  "status": "Scheduled"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Session updated successfully",
  "data": { /* updated session object */ }
}
```

### Cancel Session

**PUT** `/api/sessions/:id/cancel`

**Response**:
```json
{
  "success": true,
  "message": "Session cancelled successfully",
  "data": { /* session object with status: "Cancelled" */ }
}
```

---

## ✅ Attendance Tracking

### Mark Attendance

**POST** `/api/attendance`

**Request Body**:
```json
{
  "sessionId": "507f1f77bcf86cd799439011",
  "memberIds": [
    "507f1f77bcf86cd799439012",
    "507f1f77bcf86cd799439013",
    "507f1f77bcf86cd799439014"
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "marked": 3,
    "errors": []
  }
}
```

### Get Session Attendance

**GET** `/api/attendance/session/:id`

**Response**:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "sessionId": {
        "_id": "507f1f77bcf86cd799439011",
        "name": "Yoga Class",
        "date": "2024-01-15T00:00:00.000Z",
        "startTime": "10:00"
      },
      "memberId": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890"
      },
      "isPresent": true,
      "dateAttended": "2024-01-15T10:05:00.000Z"
    }
  ]
}
```

---

## 📊 Dashboard Analytics

### Get Dashboard Statistics

**GET** `/api/dashboard/stats`

**Response**:
```json
{
  "success": true,
  "data": {
    "activeMembersCount": 45,
    "expiringMembersCount": 5,
    "expiringMembers": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com",
        "membershipEndDate": "2024-01-20T00:00:00.000Z"
      }
    ],
    "weeklyClassesCount": 12,
    "attendancePercentage": 78,
    "completedSessionsAttendancePercentage": 82
  }
}
```

**Metrics Explained**:
- `activeMembersCount`: Number of members with valid (non-expired) memberships
- `expiringMembersCount`: Members whose membership expires within 7 days
- `expiringMembers`: Array of members expiring soon (sorted by expiry date)
- `weeklyClassesCount`: Number of non-cancelled sessions in the current week
- `attendancePercentage`: Overall attendance rate (actual attendance / capacity) for all sessions
- `completedSessionsAttendancePercentage`: Attendance rate for completed sessions only

---

## 🔍 Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes**:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found
- `500` - Internal Server Error

---

## 📝 Database Schema

### Admin
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  role: String (default: 'admin')
}
```

### Member
```javascript
{
  name: String (required),
  email: String (unique, required),
  phone: String (required),
  membershipStartDate: Date (required),
  membershipEndDate: Date (required),
  isActive: Boolean (virtual field, computed)
}
```

### Session
```javascript
{
  name: String (required),
  trainer: String (required),
  date: Date (required),
  startTime: String (required, format: HH:MM),
  capacity: Number (required, min: 1),
  status: String (enum: ['Scheduled', 'Cancelled', 'Completed'])
}
```

### Attendance
```javascript
{
  sessionId: ObjectId (ref: Session, required),
  memberId: ObjectId (ref: Member, required),
  isPresent: Boolean (default: true),
  dateAttended: Date (default: now)
}
```

---

## 🧪 Testing with cURL

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gymmini.com","password":"admin123"}'
```

### Create Member
```bash
curl -X POST http://localhost:5000/api/members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name":"John Doe",
    "email":"john@example.com",
    "phone":"1234567890",
    "membershipStartDate":"2024-01-01",
    "membershipEndDate":"2024-12-31"
  }'
```

### Get Dashboard Stats
```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🛠️ Development Notes

### Project Structure
```
gym-backend/
├── config/
│   └── database.js          # MongoDB connection
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── memberController.js  # Member CRUD
│   ├── sessionController.js # Session CRUD
│   ├── attendanceController.js # Attendance tracking
│   └── dashboardController.js  # Analytics
├── middleware/
│   └── auth.js              # JWT verification
├── models/
│   ├── Admin.js             # Admin schema
│   ├── Member.js            # Member schema
│   ├── Session.js           # Session schema
│   └── Attendance.js        # Attendance schema
├── routes/
│   ├── auth.js              # Auth routes
│   ├── members.js           # Member routes
│   ├── sessions.js          # Session routes
│   ├── attendance.js        # Attendance routes
│   └── dashboard.js         # Dashboard routes
├── utils/
│   └── seedAdmin.js         # Admin seeding script
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .gitignore
├── package.json
└── server.js                # Entry point
```

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Create initial admin user

---

## 📞 Support

For issues or questions, please contact the development team.

**Default Admin Credentials**:
- Email: `admin@gymmini.com`
- Password: `admin123`

⚠️ **Important**: Change the default password after first login!
