# Testing GymMini API in Postman

## Step 1: Login to Get Token

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Headers:
  - `Content-Type`: `application/json`
- Body (raw JSON):
```json
{
  "email": "admin@gymmini.com",
  "password": "admin123"
}
```

**Response:**
You'll get a response like:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "name": "Admin User",
      "email": "admin@gymmini.com",
      "role": "admin"
    }
  }
}
```

**COPY THE TOKEN** from `data.token`

---

## Step 2: Create a Member (with Token)

**Request:**
- Method: `POST`
- URL: `http://localhost:5000/api/members`
- Headers:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer YOUR_TOKEN_HERE` ⚠️ **IMPORTANT: Add this header!**
- Body (raw JSON):
```json
{
  "name": "Oviya",
  "email": "oviya123@gmail.com",
  "phone": "9876543210",
  "membershipStartDate": "2025-01-01",
  "membershipEndDate": "2025-12-31"
}
```

**How to Add Authorization Header in Postman:**
1. Click on the "Headers" tab
2. Add a new header:
   - Key: `Authorization`
   - Value: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (paste your token after "Bearer ")
3. Make sure there's a space between "Bearer" and the token!

---

## Step 3: Get All Members

**Request:**
- Method: `GET`
- URL: `http://localhost:5000/api/members`
- Headers:
  - `Authorization`: `Bearer YOUR_TOKEN_HERE`

---

## Step 4: Update a Member

**Request:**
- Method: `PUT`
- URL: `http://localhost:5000/api/members/MEMBER_ID_HERE`
- Headers:
  - `Content-Type`: `application/json`
  - `Authorization`: `Bearer YOUR_TOKEN_HERE`
- Body (raw JSON):
```json
{
  "name": "Oviya Updated",
  "phone": "9999999999"
}
```

---

## Step 5: Delete a Member

**Request:**
- Method: `DELETE`
- URL: `http://localhost:5000/api/members/MEMBER_ID_HERE`
- Headers:
  - `Authorization`: `Bearer YOUR_TOKEN_HERE`

---

## Common Errors

### 401 Unauthorized
**Error:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**Solution:** Add the `Authorization` header with your token

---

### 403 Forbidden
**Error:**
```json
{
  "success": false,
  "message": "Access denied. Admin role required."
}
```

**Solution:** Login with an admin account (admin@gymmini.com)

---

### 400 Bad Request
**Error:**
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

**Solution:** Make sure you include all required fields in your request body

---

## Postman Collection Setup (Optional)

### Create an Environment Variable for Token

1. Click on "Environments" in Postman
2. Create a new environment called "GymMini Local"
3. Add a variable:
   - Variable: `token`
   - Initial Value: (leave empty)
   - Current Value: (leave empty)

### Set Token Automatically After Login

In your login request, go to the "Tests" tab and add:
```javascript
var jsonData = pm.response.json();
if (jsonData.success) {
    pm.environment.set("token", jsonData.data.token);
}
```

### Use Token Variable in Other Requests

In the Authorization header, use:
```
Bearer {{token}}
```

This way, you don't have to copy/paste the token manually!

---

## Quick Test Sequence

1. **Login** → Copy token
2. **Create Member** → Use token in Authorization header
3. **Get Members** → Verify member was created
4. **Check MongoDB Compass** → Refresh and see the member in the database!

---

## Verification

After creating a member, check MongoDB:
```bash
mongosh gymmini --eval "db.members.find().pretty()"
```

You should see your member data!
