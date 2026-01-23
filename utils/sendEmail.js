const createTransporter = require('../config/email');


// Send OTP email to user

const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'GymMini <noreply@gymmini.com>',
      to: email,
      subject: 'Password Reset OTP - GymMini',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              color: #6a706aff;
              margin-bottom: 30px;
            }
            .otp-box {
              background-color: #f7f7f7ff;
              color: black;
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              letter-spacing: 8px;
              margin: 20px 0;
            }
            .info {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏋️ GymMini</h1>
              <h2>Password Reset Request</h2>
            </div>
            
            <p>Hello,</p>
            
            <p>You have requested to reset your password. Please use the following One-Time Password (OTP) to proceed:</p>
            
            <div class="otp-box">
              ${otp}
            </div>
            
            <div class="info">
              <strong>⏰ Important:</strong> This OTP will expire in <strong>10 minutes</strong>.
            </div>
            
            <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
            
            <p>For security reasons:</p>
            <ul>
              <li>Never share this OTP with anyone</li>
              <li>GymMini staff will never ask for your OTP</li>
              <li>This OTP can only be used once</li>
            </ul>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; 2024 GymMini. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error('Failed to send email');
  }
};

/**
 * Send login credentials email to new user
 * @param {string} email - Recipient email
 * @param {string} name - User name
 * @param {string} password - Generated password
 * @param {string} role - User role (admin, trainer, member)
 * @returns {Promise} - Email send result
 */
const sendCredentialsEmail = async (email, name, password, role) => {
  try {
    const transporter = createTransporter();

    const roleDisplay = {
      'admin': 'Administrator',
      'trainer': 'Trainer',
      'member': 'Trainee'
    }[role] || role;

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'GymMini <noreply@gymmini.com>',
      to: email,
      subject: `Welcome to GymMini - Your ${roleDisplay} Account`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              color: #4CAF50;
              margin-bottom: 30px;
            }
            .credentials-box {
              background-color: #fff;
              border: 2px solid #4CAF50;
              border-radius: 8px;
              padding: 20px;
              margin: 20px 0;
            }
            .credential-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .credential-row:last-child {
              border-bottom: none;
            }
            .credential-label {
              font-weight: bold;
              color: #666;
            }
            .credential-value {
              font-family: monospace;
              color: #4CAF50;
              font-weight: bold;
            }
            .info {
              background-color: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
            .button {
              display: inline-block;
              background-color: #4CAF50;
              color: white;
              padding: 12px 24px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏋️ GymMini</h1>
              <h2>Welcome, ${name}!</h2>
            </div>
            
            <p>Hello ${name},</p>
            
            <p>Your ${roleDisplay} account has been created successfully. Below are your login credentials:</p>
            
            <div class="credentials-box">
              <div class="credential-row">
                <span class="credential-label">Email:</span>
                <span class="credential-value">${email}</span>
              </div>
              <div class="credential-row">
                <span class="credential-label">Password:</span>
                <span class="credential-value">${password}</span>
              </div>
              <div class="credential-row">
                <span class="credential-label">Role:</span>
                <span class="credential-value">${roleDisplay}</span>
              </div>
            </div>
            
            <div class="info">
              <strong>🔒 Security Note:</strong> Please change your password after your first login for security purposes.
            </div>
            
            <p>You can now log in to your account using the credentials above.</p>
            
            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Login to GymMini</a>
            </div>
            
            <p>If you have any questions or need assistance, please contact our support team.</p>
            
            <div class="footer">
              <p>This is an automated email. Please do not reply.</p>
              <p>&copy; 2024 GymMini. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Credentials email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Email send error:', error);
    throw new Error('Failed to send credentials email');
  }
};

module.exports = { sendOTPEmail, sendCredentialsEmail };
