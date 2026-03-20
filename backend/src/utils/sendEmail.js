import nodemailer from "nodemailer";

// ── Transporter (lazy-initialized) ───────────────────────────
let _transporter = null;

const getTransporter = () => {
  if (_transporter) return _transporter;

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("[sendEmail] Email env vars not configured — emails will be skipped");
    return null;
  }

  _transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST,
    port:   Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_PORT === "465",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  return _transporter;
};

// ── Email templates ───────────────────────────────────────────
const TEMPLATES = {
  request_received: ({ itemTitle, requesterName }) => ({
    subject: `📨 New borrow request for "${itemTitle}"`,
    html: emailWrapper(`
      <h2>You have a new borrow request!</h2>
      <p><strong>${requesterName}</strong> wants to borrow your item:</p>
      <div class="highlight">${itemTitle}</div>
      <p>Log in to approve or reject the request.</p>
    `),
  }),

  request_approved: ({ itemTitle, ownerName }) => ({
    subject: `✅ Your request for "${itemTitle}" was approved`,
    html: emailWrapper(`
      <h2>Great news — your request was approved!</h2>
      <p><strong>${ownerName}</strong> approved your borrow request for:</p>
      <div class="highlight">${itemTitle}</div>
      <p>Please arrange pickup with the owner and return it on time.</p>
    `),
  }),

  request_rejected: ({ itemTitle }) => ({
    subject: `❌ Your request for "${itemTitle}" was declined`,
    html: emailWrapper(`
      <h2>Request not approved</h2>
      <p>Unfortunately your borrow request for <strong>${itemTitle}</strong> was declined.</p>
      <p>Browse other nearby items that might be available.</p>
    `),
  }),

  item_returned: ({ itemTitle, borrowerName }) => ({
    subject: `🔁 "${itemTitle}" has been returned`,
    html: emailWrapper(`
      <h2>Your item has been returned</h2>
      <p><strong>${borrowerName}</strong> has marked <strong>${itemTitle}</strong> as returned.</p>
      <p>Don't forget to leave a review!</p>
    `),
  }),
};

// ── Core send function ────────────────────────────────────────
/**
 * Send an email. Never throws — failure is logged and swallowed.
 *
 * @param {Object} options
 * @param {string}  options.to       - Recipient email address
 * @param {string}  options.subject  - Email subject (used if no template)
 * @param {string}  [options.html]   - Raw HTML body (used if no template)
 * @param {string}  [options.template] - Template key from TEMPLATES
 * @param {Object}  [options.data]   - Template variables
 */
const sendEmail = async ({ to, subject, html, template, data = {} }) => {
  try {
    const transporter = getTransporter();
    if (!transporter) return; // silently skip if not configured

    let mailOptions = { to, subject, html };

    if (template && TEMPLATES[template]) {
      const rendered = TEMPLATES[template](data);
      mailOptions = {
        to,
        subject: rendered.subject,
        html:    rendered.html,
      };
    }

    mailOptions.from = `"CommunityShare" <${process.env.EMAIL_USER}>`;

    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV !== "production") {
      console.log(`[sendEmail] Sent to ${to} → Message ID: ${info.messageId}`);
    }
  } catch (err) {
    // Email is non-critical — log and continue
    console.error("[sendEmail] Failed:", err.message);
  }
};

// ── HTML wrapper ──────────────────────────────────────────────
const emailWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body        { font-family: 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 0; }
    .container  { max-width: 520px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    .header     { background: #22c55e; padding: 24px 32px; }
    .header h1  { color: white; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.02em; }
    .body       { padding: 28px 32px; color: #334155; line-height: 1.7; }
    h2          { color: #0f172a; font-size: 18px; margin: 0 0 12px; }
    p           { margin: 0 0 12px; font-size: 15px; }
    .highlight  { background: #f0fdf4; border-left: 3px solid #22c55e; padding: 10px 14px; border-radius: 8px; font-weight: 600; color: #166534; margin: 16px 0; }
    .footer     { padding: 16px 32px; background: #f1f5f9; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🤝 CommunityShare</h1></div>
    <div class="body">${content}</div>
    <div class="footer">You received this because you're a member of CommunityShare. © ${new Date().getFullYear()}</div>
  </div>
</body>
</html>
`;

export default sendEmail;
