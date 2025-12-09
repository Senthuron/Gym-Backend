# Role-Based Authentication API

## Authentication Endpoints

### Register User

**POST** `/api/auth/register`

Register a new user (admin or regular user).

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "member"  // Optional: "admin", "trainer", or "member" (default: "member")
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member"
    }
  }
}
```

**Error Responses**:
- `400` - Missing required fields or invalid role
- `400` - User with email already exists
- `500` - Server error

---

### Login

**POST** `/api/auth/login`

Login for both admin and regular users.

**Request Body**:
```json
{
  "email": "admin@gymmini.com",
  "password": "admin123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "Admin User",
      "email": "admin@gymmini.com",
      "role": "admin"
    }
  }
}
```

**Error Responses**:
- `400` - Missing email or password
- `401` - Invalid credentials
- `500` - Server error

---

## Role-Based Access Control

### Roles

- **admin**: Full access to all endpoints
- **trainer**: Access to trainer dashboard, member list, and class management
- **member**: Access to member dashboard and class viewing

### Default Test Accounts

After running `npm run seed`:

**Admin Account**:
- Email: `admin@gymmini.com`
- Password: `admin123`
- Role: `admin`

**Member Account**:
- Email: `member@gymmini.com`
- Password: `member123`
- Role: `member`

---

## Protected Routes

All routes except `/api/auth/register` and `/api/auth/login` require authentication.

### Admin-Only Routes

The following routes require **admin** role:

- **Members**: All CRUD operations
  - GET `/api/members`
  - POST `/api/members`
  - PUT `/api/members/:id`
  - DELETE `/api/members/:id`

- **Sessions**: All operations
  - GET `/api/sessions`
  - POST `/api/sessions`
  - PUT `/api/sessions/:id`
  - PUT `/api/sessions/:id/cancel`

- **Attendance**: All operations
  - POST `/api/attendance`
  - GET `/api/attendance/session/:id`

- **Dashboard**: All analytics
  - GET `/api/dashboard/stats`

### Member Routes

Currently, members can authenticate and access their dashboard and profile. You can customize access by using the `requireMember` middleware for specific routes.

---

## Using Authentication

### 1. Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "password123",
    "role": "user"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gymmini.com",
    "password": "admin123"
  }'
```

### 3. Use Token for Protected Routes

Include the token in the Authorization header:

```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Middleware

### `authenticateToken`

Verifies JWT token and attaches user to `req.user`.

**Usage**:
```javascript
router.use(authenticateToken);
```

### `requireAdmin`

Ensures the authenticated user has admin role.

**Usage**:
```javascript
router.use(authenticateToken);
router.use(requireAdmin);
```

### `requireMember`

Ensures the authenticated user has member or admin role.

**Usage**:
```javascript
router.use(authenticateToken);
router.use(requireMember);
```

---

## Error Responses

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

```json
{
  "success": false,
  "message": "Invalid token."
}
```

```json
{
  "success": false,
  "message": "Token expired."
}
```

### 403 Forbidden

```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

---

## Database Schema

### User Model

```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['admin', 'trainer', 'member'], default: 'member'),
  createdAt: Date,
  updatedAt: Date
}
```

---

## Security Features

1. **Password Hashing**: All passwords are hashed using bcryptjs with 10 salt rounds
2. **JWT Tokens**: Secure token-based authentication with configurable expiry
3. **Role Validation**: Strict role checking on protected routes
4. **Email Uniqueness**: Prevents duplicate user registrations
5. **Password Never Returned**: Passwords are excluded from all responses

---

## Frontend Integration Example

```javascript
// Register
const registerUser = async (name, email, password, role = 'member') => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role })
  });
  const data = await response.json();
  
  if (data.success) {
    // Store token
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  
  return data;
};

// Login
const loginUser = async (email, password) => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  
  return data;
};

// Make authenticated request
const getMembers = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/members', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return await response.json();
};

// Check if user is admin
const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user && user.role === 'admin';
};
```

---

## Notes

- By default, new registrations create **member** role accounts
- To create an admin account via registration, explicitly set `"role": "admin"` in the request
- All management operations (members, sessions, attendance, dashboard) require **admin** role
- Members can login but will receive 403 Forbidden when accessing admin-only routes
- Tokens expire after 7 days (configurable via `JWT_EXPIRES_IN` in `.env`)
