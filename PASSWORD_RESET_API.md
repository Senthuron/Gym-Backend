# Password Reset API Documentation

## New Authentication Endpoints

### 1. Register with Password Confirmation

**POST** `/api/auth/register`

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123",  // NEW: Must match password
  "role": "user"  // Optional: "admin" or "user"
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
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

**Error Responses**:
- `400` - Passwords do not match
- `400` - Missing required fields
- `400` - User already exists

---

### 2. Forgot Password (Request OTP)

**POST** `/api/auth/forgot-password`

Send OTP to user's email for password reset.

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "OTP sent to your email. Please check your inbox."
}
```

**What Happens**:
1. Generates 6-digit OTP
2. Stores OTP in database (expires in 10 minutes)
3. Sends OTP to user's email
4. User receives email with OTP code

**Error Responses**:
- `400` - Email not provided
- `404` - No account found with this email
- `500` - Error sending email

---

### 3. Verify OTP

**POST** `/api/auth/verify-otp`

Verify the OTP code before resetting password.

**Request Body**:
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "OTP verified successfully. You can now reset your password."
}
```

**Error Responses**:
- `400` - Missing email or OTP
- `400` - Invalid OTP
- `400` - OTP has expired

---

### 4. Reset Password

**POST** `/api/auth/reset-password`

Reset password using verified OTP.

**Request Body**:
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password."
}
```

**Error Responses**:
- `400` - Missing required fields
- `400` - Passwords do not match
- `400` - Invalid or unverified OTP
- `400` - OTP has expired
- `404` - User not found

---

## Password Reset Flow

### Complete Flow Diagram

```
1. User forgets password
   ↓
2. POST /api/auth/forgot-password
   → Sends OTP to email
   ↓
3. User receives email with 6-digit OTP
   ↓
4. POST /api/auth/verify-otp
   → Verifies OTP is valid
   ↓
5. POST /api/auth/reset-password
   → Updates password
   ↓
6. User can login with new password
```

### Frontend Implementation Example

```javascript
// Step 1: Request OTP
const requestOTP = async (email) => {
  const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  return await response.json();
};

// Step 2: Verify OTP
const verifyOTP = async (email, otp) => {
  const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp })
  });
  return await response.json();
};

// Step 3: Reset Password
const resetPassword = async (email, otp, newPassword, confirmPassword) => {
  const response = await fetch('http://localhost:5000/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, newPassword, confirmPassword })
  });
  return await response.json();
};
```

---

## OTP Details

- **Format**: 6-digit numeric code (e.g., 123456)
- **Validity**: 10 minutes
- **Single-use**: OTP is deleted after successful password reset
- **Auto-cleanup**: Expired OTPs are automatically deleted from database

---

## Email Template

Users will receive a professional email with:
- 🏋️ GymMini branding
- Large, easy-to-read OTP code
- Expiration notice (10 minutes)
- Security warnings
- Responsive design for mobile

---

## Security Features

1. **Password Confirmation**: Required in both registration and reset
2. **OTP Expiration**: 10-minute validity
3. **Single-Use OTPs**: Deleted after use
4. **Email Verification**: Only registered emails can reset
5. **Secure Storage**: Passwords hashed with bcrypt
6. **Rate Limiting**: Recommended for production

---

## Testing with Postman

### Test Sequence

1. **Request OTP**:
   ```
   POST http://localhost:5000/api/auth/forgot-password
   Body: {"email":"admin@gymmini.com"}
   ```

2. **Check Email** for OTP code

3. **Verify OTP**:
   ```
   POST http://localhost:5000/api/auth/verify-otp
   Body: {"email":"admin@gymmini.com","otp":"123456"}
   ```

4. **Reset Password**:
   ```
   POST http://localhost:5000/api/auth/reset-password
   Body: {
     "email":"admin@gymmini.com",
     "otp":"123456",
     "newPassword":"newpass123",
     "confirmPassword":"newpass123"
   }
   ```

5. **Login with New Password**:
   ```
   POST http://localhost:5000/api/auth/login
   Body: {"email":"admin@gymmini.com","password":"newpass123"}
   ```

---

## Configuration Required

Before using password reset, configure email in `.env`:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM=GymMini <noreply@gymmini.com>
```

See [EMAIL_SETUP_GUIDE.md](./EMAIL_SETUP_GUIDE.md) for detailed setup instructions.

---

## Notes

- Email configuration is **required** for password reset to work
- Without email setup, forgot-password endpoint will return 500 error
- For development, use Gmail SMTP
- For production, consider SendGrid or AWS SES
