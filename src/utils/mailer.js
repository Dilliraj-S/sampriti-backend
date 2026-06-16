const nodemailer = require('nodemailer');

/**
 * Creates a Nodemailer transporter.
 * In development with no MAIL_HOST set: auto-creates an Ethereal test account.
 * Ethereal emails are viewable at https://ethereal.email — no real emails sent.
 * In production: set MAIL_HOST, MAIL_PORT, MAIL_USER, MAIL_PASS in .env.
 */
let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.MAIL_HOST) {
    transporter = nodemailer.createTransport({
      host:   process.env.MAIL_HOST,
      port:   parseInt(process.env.MAIL_PORT || '587'),
      secure: process.env.MAIL_PORT === '465',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  } else {
    // Development fallback: Ethereal fake SMTP
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host:   'smtp.ethereal.email',
      port:   587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[mailer] Using Ethereal SMTP. Preview emails at: https://ethereal.email');
    console.log('[mailer] Ethereal user:', testAccount.user);
  }

  return transporter;
};

/**
 * Sends a 6-digit OTP verification email to a new user.
 * @param {string} to - recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} name - recipient name
 */
const sendOtpEmail = async (to, otp, name) => {
  const t = await getTransporter();
  const info = await t.sendMail({
    from:    `"Sampriti Botanicals" <no-reply@sampritibotanicals.com>`,
    to,
    subject: 'Verify your email — Sampriti Botanicals',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #2C2A26;">
        <h2 style="font-weight: 400; letter-spacing: 0.08em; margin-bottom: 8px;">Welcome, ${name || 'there'}.</h2>
        <p style="color: #6C6258; margin-bottom: 24px;">Use the code below to verify your email address. It expires in <strong>10 minutes</strong>.</p>
        <div style="background: #F6F1E8; border: 1px solid #D8D0C6; padding: 24px; text-align: center; font-size: 36px; letter-spacing: 0.3em; font-weight: 600; color: #2C2A26; border-radius: 4px;">
          ${otp}
        </div>
        <p style="color: #8A7766; font-size: 13px; margin-top: 24px;">If you did not create an account, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #D8D0C6; margin: 24px 0;" />
        <p style="color: #8A7766; font-size: 12px;">Sampriti Botanicals — A botanical house of ritual science.</p>
      </div>
    `,
  });

  // In dev: log the preview URL
  if (!process.env.MAIL_HOST) {
    console.log('[mailer] OTP email preview URL:', nodemailer.getTestMessageUrl(info));
  }
};

/**
 * Sends a password reset email with a secure link.
 * @param {string} to - recipient email
 * @param {string} resetToken - raw reset token (goes into URL)
 * @param {string} name - recipient name
 */
const sendPasswordResetEmail = async (to, resetToken, name) => {
  const t = await getTransporter();
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

  const info = await t.sendMail({
    from:    `"Sampriti Botanicals" <no-reply@sampritibotanicals.com>`,
    to,
    subject: 'Reset your password — Sampriti Botanicals',
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #2C2A26;">
        <h2 style="font-weight: 400; letter-spacing: 0.08em; margin-bottom: 8px;">Password reset request</h2>
        <p style="color: #6C6258; margin-bottom: 24px;">Hello ${name || 'there'}, click the link below to reset your password. It expires in <strong>30 minutes</strong>.</p>
        <a href="${resetLink}" style="display: inline-block; background: #2C2A26; color: #FFFEF2; text-decoration: none; padding: 14px 28px; font-size: 14px; letter-spacing: 0.1em; border-radius: 2px;">
          Reset Password
        </a>
        <p style="color: #8A7766; font-size: 13px; margin-top: 24px;">If you did not request a password reset, please ignore this email.</p>
        <p style="color: #8A7766; font-size: 12px; word-break: break-all;">Or copy: ${resetLink}</p>
        <hr style="border: none; border-top: 1px solid #D8D0C6; margin: 24px 0;" />
        <p style="color: #8A7766; font-size: 12px;">Sampriti Botanicals — A botanical house of ritual science.</p>
      </div>
    `,
  });

  if (!process.env.MAIL_HOST) {
    console.log('[mailer] Reset email preview URL:', nodemailer.getTestMessageUrl(info));
  }
};

module.exports = { sendOtpEmail, sendPasswordResetEmail };
