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
      requireTLS: true,
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
  const fromEmail = process.env.MAIL_USER || 'no-reply@sampritibotanicals.com';
  const info = await t.sendMail({
    from:    `"Sampriti Botanicals" <${fromEmail}>`,
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

  if (process.env.MAIL_HOST) {
    console.log('[mailer] OTP email sent successfully to', to);
  } else {
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
  const fromEmail = process.env.MAIL_USER || 'no-reply@sampritibotanicals.com';

  const info = await t.sendMail({
    from:    `"Sampriti Botanicals" <${fromEmail}>`,
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

/**
 * Builds an HTML email body for an order status update.
 * @param {object} params
 * @param {string} params.name - customer name
 * @param {string} params.status - order status
 * @param {number} params.orderId - order id
 * @param {object} [params.shippingAddress] - shipping address (for shipped status)
 * @returns {{ subject: string, html: string }}
 */
function buildOrderStatusEmail({ name, status, orderId, shippingAddress }) {
  const orderNum = `#ORD-${String(orderId).padStart(4, '0')}`;
  const base = `
    <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #2C2A26;">
      <h2 style="font-weight: 400; letter-spacing: 0.08em; margin-bottom: 8px;">Hello ${name || 'there'},</h2>`;

  const footer = `
      <hr style="border: none; border-top: 1px solid #D8D0C6; margin: 24px 0;" />
      <p style="color: #8A7766; font-size: 12px;">Sampriti Botanicals — A botanical house of ritual science.</p>
    </div>`;

  switch (status) {
    case 'processing':
      return { subject: `Order ${orderNum} confirmed — We're preparing your items`, html: base + `
        <p style="color: #6C6258; margin-bottom: 20px;">Thank you for your order! We're pleased to confirm that order <strong>${orderNum}</strong> is now being processed.</p>
        <p style="color: #6C6258; margin-bottom: 20px;">Our team is carefully preparing your items. You'll receive a notification once they're shipped.</p>
        <p style="color: #6C6258;">If you have any questions, feel free to reply to this email.</p>` + footer };

    case 'shipped': {
      const addr = shippingAddress;
      const addrBlock = addr
        ? `<p style="color: #6C6258; margin-bottom: 4px;">${addr.address_line1 || addr.address || ''}</p>
           <p style="color: #6C6258; margin-bottom: 4px;">${addr.city || ''}${addr.city && addr.state ? ', ' : ''}${addr.state || ''} ${addr.pincode || ''}</p>
           <p style="color: #6C6258; margin-bottom: 12px;">${addr.country || ''}</p>`
        : '';
      return { subject: `Order ${orderNum} shipped! 🚚 Tracking inside`, html: base + `
        <p style="color: #6C6258; margin-bottom: 20px;">Great news! Your order <strong>${orderNum}</strong> has been shipped and is on its way.</p>
        <div style="background: #F6F1E8; border: 1px solid #D8D0C6; padding: 20px; border-radius: 4px; margin-bottom: 20px;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #2C2A26; font-size: 13px; letter-spacing: 0.05em;">SHIPPING ADDRESS</p>
          ${addrBlock}
        </div>
        <p style="color: #6C6258;">Estimated delivery: <strong>5–7 business days</strong>. We'll keep you updated every step of the way.</p>` + footer };
    }

    case 'delivered':
      return { subject: `Order ${orderNum} delivered! Enjoy your products ✨`, html: base + `
        <p style="color: #6C6258; margin-bottom: 20px;">Your order <strong>${orderNum}</strong> has been delivered successfully.</p>
        <p style="color: #6C6258; margin-bottom: 20px;">We hope you love your products! If anything isn't perfect, please reach out and we'll make it right.</p>
        <p style="color: #6C6258;">Thank you for choosing Sampriti Botanicals. We look forward to welcoming you again.</p>` + footer };

    case 'cancelled':
      return { subject: `Order ${orderNum} cancelled`, html: base + `
        <p style="color: #6C6258; margin-bottom: 20px;">Your order <strong>${orderNum}</strong> has been cancelled as requested.</p>
        <p style="color: #6C6258; margin-bottom: 20px;">If you paid via PayPal, the refund will be processed within 3–5 business days.</p>
        <p style="color: #6C6258;">If you believe this was a mistake, please contact us and we'll be happy to help.</p>` + footer };

    case 'pending':
    default:
      return { subject: `Order ${orderNum} placed successfully`, html: base + `
        <p style="color: #6C6258; margin-bottom: 20px;">Your order <strong>${orderNum}</strong> has been placed successfully.</p>
        <p style="color: #6C6258; margin-bottom: 20px;">We're reviewing your order and will confirm once it moves to processing.</p>
        <p style="color: #6C6258;">You can track your order status anytime in your account.</p>` + footer };
  }
}

/**
 * Sends an order status update email to a customer.
 * @param {string} to - recipient email
 * @param {string} name - customer name
 * @param {string} status - order status
 * @param {number} orderId - order id
 * @param {object} [shippingAddress] - used when status is 'shipped'
 */
const sendOrderStatusEmail = async (to, name, status, orderId, shippingAddress) => {
  const t = await getTransporter();
  const fromEmail = process.env.MAIL_USER || 'no-reply@sampritibotanicals.com';
  const { subject, html } = buildOrderStatusEmail({ name, status, orderId, shippingAddress });

  const info = await t.sendMail({
    from: `"Sampriti Botanicals" <${fromEmail}>`,
    to,
    subject,
    html,
  });

  if (process.env.MAIL_HOST) {
    const accepted = info.accepted?.join(',') || '';
    const rejected = info.rejected?.join(',') || '';
    console.log('[mailer] Order status email sent - to:', to, 'status:', status, '| accepted:', accepted, '| rejected:', rejected);
    if (rejected) console.warn('[mailer] WARNING: Email was REJECTED by SMTP server for:', rejected);
  } else {
    console.log('[mailer] Order status email preview URL:', nodemailer.getTestMessageUrl(info));
  }
};

module.exports = { sendOtpEmail, sendPasswordResetEmail, sendOrderStatusEmail };
