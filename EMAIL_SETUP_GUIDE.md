# Email Configuration Guide for Password Reset

## Setting Up Gmail for Sending OTP Emails

To enable password reset functionality with OTP emails, you need to configure Gmail SMTP.

### Step 1: Enable 2-Step Verification

1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click on "2-Step Verification"
4. Follow the prompts to enable 2-Step Verification

### Step 2: Generate App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select app: "Mail"
3. Select device: "Other (Custom name)"
4. Enter name: "GymMini Backend"
5. Click "Generate"
6. **Copy the 16-character password** (it will look like: `xxxx xxxx xxxx xxxx`)

### Step 3: Update .env File

Open your `.env` file and update the email configuration:

```env
# Email Configuration (for OTP/Password Reset)
EMAIL_SERVICE=gmail
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # The app password from Step 2
EMAIL_FROM=GymMini <noreply@gymmini.com>
```

**Example:**
```env
EMAIL_SERVICE=gmail
EMAIL_USER=priya@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=GymMini <noreply@gymmini.com>
```

### Step 4: Restart the Server

After updating the .env file, restart your server:

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

---

## Testing Email Functionality

### Test 1: Request Password Reset

```bash
curl -X POST http://localhost:5000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gymmini.com"}'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email. Please check your inbox."
}
```

**Check your email** - You should receive an OTP code.

### Test 2: Verify OTP

```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gymmini.com","otp":"123456"}'
```

### Test 3: Reset Password

```bash
curl -X POST http://localhost:5000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@gymmini.com",
    "otp":"123456",
    "newPassword":"newpassword123",
    "confirmPassword":"newpassword123"
  }'
```

---

## Troubleshooting

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution**: Make sure you're using an App Password, not your regular Gmail password.

### Error: "Error sending OTP"

**Possible causes:**
1. Email credentials are incorrect
2. App password not generated
3. 2-Step Verification not enabled
4. Network/firewall blocking SMTP

**Solution**: Double-check your email configuration in `.env`

### Email not received

**Check:**
1. Spam/Junk folder
2. Email address is correct
3. Gmail account has sending limits (500 emails/day)

---

## Alternative: Using SendGrid (Production)

For production, consider using SendGrid:

1. Sign up at: https://sendgrid.com/
2. Get API key
3. Update `.env`:

```env
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@yourdomain.com
```

---

## Security Notes

- **Never commit `.env` file** to version control
- **Use environment variables** in production
- **Rotate app passwords** periodically
- **Monitor email sending** for abuse
- **Add rate limiting** in production to prevent spam

---

## Status

Once configured, your password reset system will:
- ✅ Send OTP emails to users
- ✅ Verify OTP codes
- ✅ Allow password reset
- ✅ Auto-expire OTPs after 10 minutes
