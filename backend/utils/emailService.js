import nodemailer from 'nodemailer';

// Helper to create transporter based on environment variables
const createTransporter = () => {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }
  return null;
};

/**
 * Send OTP Email for Admin Password Reset
 */
export const sendOtpEmail = async (toEmail, otp, name = 'Administrator') => {
  const subject = `Your Password Reset OTP - Sudisha Foundation Portal`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
      <div style="background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Sudisha Foundation</h1>
        <p style="color: #e2e8f0; margin: 4px 0 0; font-size: 13px;">Management &amp; Administrative Portal</p>
      </div>
      <div style="padding: 28px 24px;">
        <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Password Reset Verification</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">Hello <strong>${name}</strong>,</p>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">We received a request to reset the password for your Admin account. Use the 6-digit verification code below to proceed:</p>
        
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
          <div style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #38bdf8; font-family: monospace;">${otp}</div>
          <p style="color: #64748b; font-size: 12px; margin: 8px 0 0;">Valid for 10 minutes. Do not share this code with anyone.</p>
        </div>

        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">If you did not request this password reset, you can safely ignore this email.</p>
      </div>
      <div style="background: #090d16; padding: 14px 24px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b;">
        Sudisha Foundation &copy; ${new Date().getFullYear()} &bull; Secure Portal Access
      </div>
    </div>
  `;

  const transporter = createTransporter();
  if (!transporter && process.env.NODE_ENV === 'production') {
    throw new Error('SMTP is not configured; password reset email cannot be sent.');
  }
  if (!transporter) {
    console.log(`Development OTP for ${toEmail}: ${otp}`);
    return { success: true, mode: 'console' };
  }

  try {
    await transporter.sendMail({
      from: `"Sudisha Foundation" <${process.env.EMAIL_USER || 'no-reply@sudishafoundation.org'}>`,
      to: toEmail,
      subject,
      html
    });
    return { success: true, mode: 'smtp' };
  } catch (err) {
    console.error(`Failed to send OTP email: ${err.message}`);
    throw err;
  }
};

/**
 * Send New Password Email to Manager / Intern
 */
export const sendNewPasswordEmail = async (toEmail, newPassword, name = 'User', role = 'intern') => {
  const subject = `Your New Password Credentials - Sudisha Foundation Portal`;
  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #f8fafc; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
      <div style="background: linear-gradient(135deg, #2563eb, #10b981); padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700;">Sudisha Foundation</h1>
        <p style="color: #e2e8f0; margin: 4px 0 0; font-size: 13px;">Management &amp; Administrative Portal</p>
      </div>
      <div style="padding: 28px 24px;">
        <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Password Reset Completed</h2>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">Hello <strong>${name}</strong>,</p>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.5;">Your request to reset your password has been approved by the Admin. Your new login credentials are provided below:</p>
        
        <div style="background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <div style="margin-bottom: 10px; font-size: 14px; color: #cbd5e1;">
            <strong style="color: #94a3b8;">Email Address:</strong> ${toEmail}
          </div>
          <div style="margin-bottom: 10px; font-size: 14px; color: #cbd5e1;">
            <strong style="color: #94a3b8;">Portal Role:</strong> <span style="text-transform: capitalize; color: #38bdf8; font-weight: 600;">${role}</span>
          </div>
          <div style="font-size: 14px; color: #cbd5e1;">
            <strong style="color: #94a3b8;">New Password:</strong>
            <span style="font-family: monospace; font-size: 18px; font-weight: 700; color: #4ade80; background: #0f172a; padding: 4px 10px; border-radius: 4px; margin-left: 8px; border: 1px dashed #22c55e;">${newPassword}</span>
          </div>
        </div>

        <p style="color: #94a3b8; font-size: 13px; line-height: 1.5;">Please log in to the portal using this new password. You can change your password anytime from your profile settings.</p>
      </div>
      <div style="background: #090d16; padding: 14px 24px; text-align: center; border-top: 1px solid #1e293b; font-size: 11px; color: #64748b;">
        Sudisha Foundation &copy; ${new Date().getFullYear()} &bull; Secure Portal Access
      </div>
    </div>
  `;

  const transporter = createTransporter();
  if (!transporter && process.env.NODE_ENV === 'production') {
    throw new Error('SMTP is not configured; password email cannot be sent.');
  }
  if (!transporter) {
    return { success: true, mode: 'console' };
  }

  try {
    await transporter.sendMail({
      from: `"Sudisha Foundation" <${process.env.EMAIL_USER || 'no-reply@sudishafoundation.org'}>`,
      to: toEmail,
      subject,
      html
    });
    return { success: true, mode: 'smtp' };
  } catch (err) {
    console.error(`Failed to send password email: ${err.message}`);
    throw err;
  }
};
