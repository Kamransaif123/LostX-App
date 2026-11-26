const nodemailer = require('nodemailer');

let transporter = null;

if (process.env.SMTP_HOST && process.env.SMTP_USER) {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

/**
 * Sends an email notification or logs to console in development
 */
async function sendEmail({ to, subject, text, html }) {
  if (!to) return;

  const mailOptions = {
    from: process.env.SMTP_FROM || '"LostX Campus" <noreply@lostx.campus>',
    to,
    subject,
    text,
    html: html || `<p>${text}</p>`
  };

  if (transporter) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL SENT] To: ${to} | ID: ${info.messageId}`);
      return info;
    } catch (err) {
      console.error(`[EMAIL ERROR] Failed to send email to ${to}:`, err.message);
    }
  } else {
    // Development mode fallback: log cleanly to server console
    console.log(`[EMAIL DISPATCH - DEV] To: ${to}`);
    console.log(`  Subject: ${subject}`);
    console.log(`  Message: ${text}\n`);
  }
}

/**
 * Sends an email when a high-confidence match is discovered
 */
async function sendMatchNotificationEmail({ toEmail, toName, itemTitle, matchedTitle, score, itemId }) {
  if (!toEmail) return;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const itemUrl = `${clientUrl}/items/${itemId}`;

  const subject = `[LostX] Possible Match Found (${score}%): "${itemTitle}"`;
  const text = `Hi ${toName || 'there'},\n\nA potential match (${score}%) was found on LostX for your item "${itemTitle}".\nCandidate: "${matchedTitle}"\n\nView details and claim if it's yours:\n${itemUrl}\n\n- LostX Campus Team`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
      <h2 style="color: #4f46e5; margin-top: 0;">LostX Match Alert</h2>
      <p>Hi <strong>${toName || 'there'}</strong>,</p>
      <p>Our matching engine found a <strong>${score}% confidence match</strong> for your reported item <em>"${itemTitle}"</em>.</p>
      <div style="background-color: #f8fafc; padding: 12px 16px; border-radius: 6px; border-left: 4px solid #4f46e5; margin: 15px 0;">
        <strong>Potential Match:</strong> ${matchedTitle}
      </div>
      <p><a href="${itemUrl}" style="background-color: #4f46e5; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View Candidate Item</a></p>
      <p style="color: #64748b; font-size: 12px; margin-top: 25px;">LostX Campus Lost & Found System</p>
    </div>
  `;

  return sendEmail({ to: toEmail, subject, text, html });
}

/**
 * Sends an email on claim approval or rejection
 */
async function sendClaimDecisionEmail({ toEmail, toName, itemTitle, status, handoverInfo, adminNote, itemId }) {
  if (!toEmail) return;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const itemUrl = `${clientUrl}/items/${itemId}`;
  const isApproved = status === 'approved';

  const subject = isApproved
    ? `[LostX] Claim APPROVED for "${itemTitle}"`
    : `[LostX] Claim Update: "${itemTitle}"`;

  let text = `Hi ${toName || 'there'},\n\n`;
  if (isApproved) {
    text += `Great news! Your verification claim for "${itemTitle}" was APPROVED by the campus administrator.\n`;
    if (handoverInfo) {
      text += `Handover Location: ${handoverInfo}\n`;
    }
    text += `Please carry your campus student/staff ID card for physical collection.\n`;
  } else {
    text += `Your claim for "${itemTitle}" was rejected.\n`;
    if (adminNote) {
      text += `Admin Reason: ${adminNote}\n`;
    }
  }
  text += `\nView full report: ${itemUrl}\n\n- LostX Campus Team`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 8px;">
      <h2 style="color: ${isApproved ? '#059669' : '#dc2626'}; margin-top: 0;">
        ${isApproved ? 'Claim Approved!' : 'Claim Notice'}
      </h2>
      <p>Hi <strong>${toName || 'there'}</strong>,</p>
      <p>Your verification claim for <strong>"${itemTitle}"</strong> was <strong>${status.toUpperCase()}</strong> by the administrator.</p>
      ${
        isApproved && handoverInfo
          ? `<div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; margin: 15px 0;">
               <strong>Handover Location:</strong> ${handoverInfo}<br/>
               <small style="color: #065f46;">Please bring your campus ID when collecting your item.</small>
             </div>`
          : ''
      }
      ${
        !isApproved && adminNote
          ? `<div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px; margin: 15px 0;">
               <strong>Admin Feedback:</strong> ${adminNote}
             </div>`
          : ''
      }
      <p><a href="${itemUrl}" style="background-color: #4f46e5; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View Details on LostX</a></p>
      <p style="color: #64748b; font-size: 12px; margin-top: 25px;">LostX Campus Lost & Found System</p>
    </div>
  `;

  return sendEmail({ to: toEmail, subject, text, html });
}

/**
 * Sends an email to admins when a new claim is submitted for review
 */
async function sendNewClaimAdminEmail({ toEmail, toName, itemTitle, claimantName, claimantEmail }) {
  if (!toEmail) return;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const claimsUrl = `${clientUrl}/admin/claims`;

  const subject = `[LostX] New Claim Pending Review: "${itemTitle}"`;
  const text = `Hi ${toName || 'Admin'},\n\n${claimantName || 'A campus user'} (${claimantEmail || ''}) submitted a new claim for "${itemTitle}".\n\nReview the verification details in the admin queue:\n${claimsUrl}\n\n- LostX Campus Team`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #4f46e5; margin-top: 0;">New Claim Submitted</h2>
      <p>Hi <strong>${toName || 'Admin'}</strong>,</p>
      <p><strong>${claimantName || 'A campus user'}</strong> (${claimantEmail || ''}) submitted a verification claim for <strong>"${itemTitle}"</strong>.</p>
      <p><a href="${claimsUrl}" style="background-color: #4f46e5; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Review Claims Queue</a></p>
      <p style="color: #64748b; font-size: 12px; margin-top: 25px;">LostX Campus Lost & Found System</p>
    </div>
  `;

  return sendEmail({ to: toEmail, subject, text, html });
}

module.exports = {
  sendEmail,
  sendMatchNotificationEmail,
  sendClaimDecisionEmail,
  sendNewClaimAdminEmail
};
