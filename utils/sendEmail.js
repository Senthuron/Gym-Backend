const createTransporter = require('../config/email');

/**
 * Send OTP email to user
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP code
 * @returns {Promise} - Email send result
 */
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
              color: #4CAF50;
              margin-bottom: 30px;
            }
            .otp-box {
              background-color: #4CAF50;
              color: white;
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

module.exports = { sendOTPEmail };
