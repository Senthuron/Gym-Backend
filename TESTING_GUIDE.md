# GymMini Backend - Quick Test Guide

## 🚀 Testing Role-Based Authentication

### 1. Start the Server

```bash
cd /home/priya/gym-backend
npm run dev
```

Server should be running on `http://localhost:5000`

---

## 📝 Test Accounts

**Admin Account**:
- Email: `admin@gymmini.com`
- Password: `admin123`
- Role: `admin`

**User Account**:
- Email: `user@gymmini.com`
- Password: `user123`
- Role: `user`

---

## 🧪 API Testing Examples

### Test 1: Register a New User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "role": "user"
  }'
```

**Expected Response**: 201 Created with token and user details

---

### Test 2: Login as Admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@gymmini.com",
    "password": "admin123"
  }'
```

**Expected Response**: 200 OK with token
**Save the token** for next requests!

---

### Test 3: Login as Regular User

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@gymmini.com",
    "password": "user123"
  }'
```

**Expected Response**: 200 OK with token

---

### Test 4: Access Admin-Only Route (with Admin Token)

```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

**Expected Response**: 200 OK with dashboard statistics

---

### Test 5: Access Admin-Only Route (with User Token)

```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer USER_TOKEN_HERE"
```

**Expected Response**: 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

---

### Test 6: Create a Member (Admin Only)

```bash
curl -X POST http://localhost:5000/api/members \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john@example.com",
    "phone": "1234567890",
    "membershipStartDate": "2024-01-01",
    "membershipEndDate": "2024-12-31"
  }'
```

**Expected Response**: 201 Created with member details

---

## 🔍 Role-Based Access Summary

| Endpoint | Admin | User |
|----------|-------|------|
| POST /api/auth/register | ✅ | ✅ |
| POST /api/auth/login | ✅ | ✅ |
| GET /api/members | ✅ | ❌ |
| POST /api/members | ✅ | ❌ |
| PUT /api/members/:id | ✅ | ❌ |
| DELETE /api/members/:id | ✅ | ❌ |
| GET /api/sessions | ✅ | ❌ |
| POST /api/sessions | ✅ | ❌ |
| PUT /api/sessions/:id | ✅ | ❌ |
| PUT /api/sessions/:id/cancel | ✅ | ❌ |
| POST /api/attendance | ✅ | ❌ |
| GET /api/attendance/session/:id | ✅ | ❌ |
| GET /api/dashboard/stats | ✅ | ❌ |

---

## 📚 Full Documentation

- [API Documentation](./API_DOCUMENTATION.md)
- [Role-Based Auth Guide](./ROLE_BASED_AUTH.md)
- [README](./README.md)
