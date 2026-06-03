import { Resend } from 'resend';

// Use your own verified domain in production: resend.com/domains
// Until then, Resend's shared test domain works out of the box
const FROM_ADDRESS = process.env.EMAIL_FROM || 'PadelPro <onboarding@resend.dev>';
const BRAND_COLOR = '#22C55E';

let resendClient = null;
const getResend = () => {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resendClient) resendClient = new Resend(process.env.RESEND_API_KEY);
  return resendClient;
};

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#0F0F0F;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0F0F0F;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1A1A1A;border-radius:16px;border:1px solid #2A2A2A;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#111111;padding:28px 40px;border-bottom:1px solid #2A2A2A;">
            <table width="100%" cellpadding="0" cellspacing="0"><tr>
              <td><span style="font-size:22px;font-weight:900;letter-spacing:-0.5px;color:#FFFFFF;">PADEL<span style="color:${BRAND_COLOR};">PRO</span></span></td>
              <td align="right"><span style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#555555;">Pakistan's #1 Padel Platform</span></td>
            </tr></table>
          </td>
        </tr>
        <tr><td style="padding:40px;">${content}</td></tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #2A2A2A;background:#111111;">
            <p style="margin:0;font-size:11px;color:#555555;text-align:center;">
              &copy; 2026 PadelPro Karachi &nbsp;&bull;&nbsp; Pakistan's premier padel sports platform<br />
              <span style="color:#444444;">You're receiving this because you have an account on PadelPro.</span>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const sendEmail = async ({ to, subject, html }) => {
  const resend = getResend();
  if (!resend) {
    console.log(`\n📧 [DEV — set RESEND_API_KEY to send real emails]`);
    console.log(`   To: ${to}`);
    console.log(`   Subject: ${subject}\n`);
    return { id: 'dev-mock', simulated: true };
  }
  try {
    const { data, error } = await resend.emails.send({ from: FROM_ADDRESS, to, subject, html });
    if (error) { console.error('Resend error:', error); return null; }
    console.log(`📧 Email sent → ${to} (id: ${data.id})`);
    return data;
  } catch (err) {
    console.error('Email delivery failed:', err.message);
    return null;
  }
};

export const sendOtpEmail = async (email, code, name = '') => {
  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;">Verify your email</h1>
    <p style="margin:0 0 32px;font-size:15px;color:#888888;">Hi ${name || 'there'}, use the code below to verify your PadelPro account.</p>
    <div style="background:#0F0F0F;border:1px solid #2A2A2A;border-radius:12px;padding:32px;text-align:center;margin-bottom:32px;">
      <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:#555555;">Your verification code</p>
      <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:${BRAND_COLOR};font-family:monospace;">${code}</div>
      <p style="margin:16px 0 0;font-size:12px;color:#555555;">Valid for <strong style="color:#888888;">10 minutes</strong></p>
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#666666;">Enter this code in the PadelPro app to complete your registration.</p>
    <p style="margin:0;font-size:12px;color:#444444;">If you didn't create an account, you can safely ignore this email.</p>
  `);
  return sendEmail({ to: email, subject: `${code} — Your PadelPro verification code`, html });
};

export const sendBookingConfirmation = async (user, booking) => {
  const rows = [
    ['Court', booking.courtName],
    ['Date', booking.date],
    ['Time', `${booking.startTime} (${booking.duration}h)`],
    ['Location', booking.courtArea || 'Karachi'],
    ['Amount Paid', `Rs ${Number(booking.totalAmount || 0).toLocaleString()}`],
    ['Booking Ref', booking.bookingRef || 'N/A'],
  ];
  const html = baseTemplate(`
    <div style="display:inline-block;background:${BRAND_COLOR}15;border:1px solid ${BRAND_COLOR}30;border-radius:8px;padding:6px 14px;margin-bottom:24px;">
      <span style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${BRAND_COLOR};">Booking Confirmed</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;">You're on the court! 🎾</h1>
    <p style="margin:0 0 32px;font-size:15px;color:#888888;">Hi ${user.name}, your booking at <strong style="color:#CCCCCC;">${booking.courtName}</strong> is confirmed.</p>
    <div style="background:#0F0F0F;border:1px solid #2A2A2A;border-radius:12px;overflow:hidden;margin-bottom:32px;">
      <div style="padding:16px 24px;border-bottom:1px solid #2A2A2A;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#555555;">Booking Details</p>
      </div>
      ${rows.map(([l, v], i) => `<tr style="background:${i%2?'#0D0D0D':'transparent'};display:block;"><td style="display:inline-block;padding:12px 24px;font-size:13px;font-weight:600;color:#555555;width:38%;">${l}</td><td style="display:inline-block;padding:12px 24px 12px 0;font-size:13px;color:#CCCCCC;">${v}</td></tr>`).join('')}
    </div>
    <p style="margin:0;font-size:13px;color:#666666;">Need to change plans? Cancel or reschedule from your <strong style="color:#888888;">Dashboard</strong>.</p>
  `);
  return sendEmail({ to: user.email, subject: `Booking Confirmed — ${booking.courtName} on ${booking.date}`, html });
};

export const sendRescheduleConfirmation = async (user, booking) => {
  const html = baseTemplate(`
    <div style="display:inline-block;background:#3B82F615;border:1px solid #3B82F630;border-radius:8px;padding:6px 14px;margin-bottom:24px;">
      <span style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#3B82F6;">Booking Rescheduled</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;">See you at the new time!</h1>
    <p style="margin:0 0 32px;font-size:15px;color:#888888;">Hi ${user.name}, your booking for <strong style="color:#CCCCCC;">${booking.courtName}</strong> has been rescheduled.</p>
    <div style="background:#0F0F0F;border:1px solid #2A2A2A;border-radius:12px;overflow:hidden;margin-bottom:32px;">
      <div style="padding:12px 24px;border-bottom:1px solid #2A2A2A;display:block;"><span style="font-size:13px;font-weight:600;color:#555555;width:38%;display:inline-block;">New Date</span><span style="font-size:13px;color:#CCCCCC;">${booking.date}</span></div>
      <div style="padding:12px 24px;background:#0D0D0D;display:block;border-bottom:1px solid #2A2A2A;"><span style="font-size:13px;font-weight:600;color:#555555;width:38%;display:inline-block;">New Time</span><span style="font-size:13px;color:#CCCCCC;">${booking.startTime}</span></div>
      <div style="padding:12px 24px;display:block;"><span style="font-size:13px;font-weight:600;color:#555555;width:38%;display:inline-block;">Court</span><span style="font-size:13px;color:#CCCCCC;">${booking.courtName}</span></div>
    </div>
    <p style="margin:0;font-size:13px;color:#666666;">We look forward to seeing you on the court!</p>
  `);
  return sendEmail({ to: user.email, subject: `Booking Rescheduled — ${booking.courtName}`, html });
};

export const sendBookingCancellation = async (user, booking) => {
  const html = baseTemplate(`
    <div style="display:inline-block;background:#EF444415;border:1px solid #EF444430;border-radius:8px;padding:6px 14px;margin-bottom:24px;">
      <span style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#EF4444;">Booking Cancelled</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;">Your booking was cancelled</h1>
    <p style="margin:0 0 32px;font-size:15px;color:#888888;">Hi ${user.name}, your booking for <strong style="color:#CCCCCC;">${booking.courtName}</strong> on ${booking.date} has been cancelled.</p>
    <p style="margin:0 0 24px;font-size:13px;color:#666666;">If you have questions about refunds, please contact the court directly.</p>
    <a href="https://padelpro.pk/courts" style="display:inline-block;background:${BRAND_COLOR};color:#000000;font-size:14px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;">Browse Courts Again →</a>
  `);
  return sendEmail({ to: user.email, subject: `Booking Cancelled — ${booking.courtName}`, html });
};

export const sendMatchInvite = async (recipient, sender, match) => {
  const html = baseTemplate(`
    <div style="display:inline-block;background:#8B5CF615;border:1px solid #8B5CF630;border-radius:8px;padding:6px 14px;margin-bottom:24px;">
      <span style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#8B5CF6;">Match Request</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;">You have a match request!</h1>
    <p style="margin:0 0 32px;font-size:15px;color:#888888;"><strong style="color:#CCCCCC;">${sender.name}</strong> wants to play with you on PadelPro.</p>
    <div style="background:#0F0F0F;border:1px solid #2A2A2A;border-radius:12px;padding:24px;margin-bottom:32px;">
      <p style="margin:0;font-size:16px;font-weight:700;color:#FFFFFF;">${sender.name}</p>
      <p style="margin:4px 0 0;font-size:12px;color:#555555;">${sender.skillLevel || 'Padel Player'} &bull; ${sender.city || 'Karachi'}</p>
      ${match.preferredDate ? `<p style="margin:16px 0 0;padding-top:16px;border-top:1px solid #2A2A2A;font-size:13px;color:#888888;">Preferred date: <strong style="color:#CCCCCC;">${match.preferredDate}</strong></p>` : ''}
    </div>
    <a href="https://padelpro.pk/matches" style="display:inline-block;background:${BRAND_COLOR};color:#000000;font-size:14px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;">View Match Request →</a>
  `);
  return sendEmail({ to: recipient.email, subject: `${sender.name} wants to play with you on PadelPro!`, html });
};

export const sendMatchAccepted = async (requestor, acceptor) => {
  const html = baseTemplate(`
    <div style="display:inline-block;background:${BRAND_COLOR}15;border:1px solid ${BRAND_COLOR}30;border-radius:8px;padding:6px 14px;margin-bottom:24px;">
      <span style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${BRAND_COLOR};">Match Accepted!</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;">Game on! 🎾</h1>
    <p style="margin:0 0 32px;font-size:15px;color:#888888;"><strong style="color:#CCCCCC;">${acceptor.name}</strong> accepted your match request. Head over to chat and arrange the details.</p>
    <a href="https://padelpro.pk/chat" style="display:inline-block;background:${BRAND_COLOR};color:#000000;font-size:14px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;">Open Chat →</a>
  `);
  return sendEmail({ to: requestor.email, subject: `${acceptor.name} accepted your match request!`, html });
};

export const sendReviewPrompt = async (user, match) => {
  const opponentName = match.opponentName || 'your opponent';
  const html = baseTemplate(`
    <div style="display:inline-block;background:#F59E0B15;border:1px solid #F59E0B30;border-radius:8px;padding:6px 14px;margin-bottom:24px;">
      <span style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#F59E0B;">Rate Your Match</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;">How was your game?</h1>
    <p style="margin:0 0 32px;font-size:15px;color:#888888;">Hi ${user.name}, you recently played with <strong style="color:#CCCCCC;">${opponentName}</strong>. It only takes 30 seconds to rate the experience.</p>
    <div style="background:#0F0F0F;border:1px solid #2A2A2A;border-radius:12px;padding:24px;text-align:center;margin-bottom:32px;">
      <p style="margin:0 0 16px;font-size:13px;color:#555555;">Rate ${opponentName} on:</p>
      <div style="font-size:12px;color:#888888;line-height:2;">Sportsmanship &nbsp;&bull;&nbsp; Punctuality &nbsp;&bull;&nbsp; Skill<br />Communication &nbsp;&bull;&nbsp; Teamwork</div>
    </div>
    <a href="https://padelpro.pk/matches" style="display:inline-block;background:${BRAND_COLOR};color:#000000;font-size:14px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;">Leave a Review →</a>
    <p style="margin:16px 0 0;font-size:11px;color:#444444;">Reviews help build trust in the PadelPro community.</p>
  `);
  return sendEmail({ to: user.email, subject: `How was your match with ${opponentName}? Leave a quick review`, html });
};

export const sendBookingReviewPrompt = async (user, booking) => {
  const courtName = booking.court?.name || 'your court';
  const location = [booking.court?.area, booking.court?.address].filter(Boolean).join(', ');
  const date = booking.date || '';
  const startTime = booking.startTime || '';
  const html = baseTemplate(`
    <div style="display:inline-block;background:#F59E0B15;border:1px solid #F59E0B30;border-radius:8px;padding:6px 14px;margin-bottom:24px;">
      <span style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#F59E0B;">Rate Your Session</span>
    </div>
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;">How was your game?</h1>
    <p style="margin:0 0 32px;font-size:15px;color:#888888;">Hi ${user.name}, your session at <strong style="color:#CCCCCC;">${courtName}</strong> has wrapped up. Leave a quick review — it only takes 30 seconds.</p>
    <div style="background:#0F0F0F;border:1px solid #2A2A2A;border-radius:12px;padding:24px;margin-bottom:32px;">
      <div style="display:flex;align-items:center;margin-bottom:12px;">
        <span style="font-size:22px;margin-right:12px;">🎾</span>
        <strong style="font-size:15px;color:#FFFFFF;">${courtName}</strong>
      </div>
      ${location ? `<p style="margin:0 0 6px;font-size:13px;color:#555555;">📍 ${location}</p>` : ''}
      ${date ? `<p style="margin:0;font-size:13px;color:#555555;">🗓 ${date}${startTime ? ' at ' + startTime : ''}</p>` : ''}
    </div>
    <p style="margin:0 0 8px;font-size:13px;color:#555555;text-align:center;">Rate the court on:</p>
    <p style="margin:0 0 28px;font-size:12px;color:#444444;text-align:center;">Surface Quality &nbsp;&bull;&nbsp; Lighting &nbsp;&bull;&nbsp; Cleanliness &nbsp;&bull;&nbsp; Facilities &nbsp;&bull;&nbsp; Staff</p>
    <div style="text-align:center;">
      <a href="https://padelpro.pk/courts" style="display:inline-block;background:${BRAND_COLOR};color:#000000;font-size:14px;font-weight:700;padding:14px 28px;border-radius:10px;text-decoration:none;">Leave a Review →</a>
    </div>
    <p style="margin:16px 0 0;font-size:11px;color:#444444;text-align:center;">Your reviews help other players find the best courts in Karachi.</p>
  `);
  return sendEmail({ to: user.email, subject: `How was ${courtName}? Leave a quick review`, html });
};

export const sendWelcomeEmail = async (user) => {
  const features = [
    ['🎾', 'Book Courts', 'Find and book padel courts across Karachi'],
    ['🤝', 'Find Partners', 'Get matched with players at your skill level'],
    ['🏆', 'Join Tournaments', 'Compete in local and citywide tournaments'],
    ['🛒', 'Gear Marketplace', 'Buy and sell padel equipment with other players'],
  ];
  const html = baseTemplate(`
    <h1 style="margin:0 0 8px;font-size:28px;font-weight:900;color:#FFFFFF;letter-spacing:-0.5px;">Welcome to PadelPro! 🎾</h1>
    <p style="margin:0 0 32px;font-size:15px;color:#888888;">Hi ${user.name}, you're now part of Pakistan's fastest-growing padel community. Here's what you can do:</p>
    <div style="background:#0F0F0F;border:1px solid #2A2A2A;border-radius:12px;overflow:hidden;margin-bottom:32px;">
      ${features.map(([e, t, d], i) => `
        <div style="padding:16px 24px;${i < 3 ? 'border-bottom:1px solid #2A2A2A;' : ''}">
          <span style="font-size:20px;margin-right:12px;">${e}</span>
          <strong style="font-size:14px;color:#FFFFFF;">${t}</strong>
          <span style="font-size:13px;color:#555555;margin-left:8px;">${d}</span>
        </div>`).join('')}
    </div>
    <div style="text-align:center;">
      <a href="https://padelpro.pk/courts" style="display:inline-block;background:${BRAND_COLOR};color:#000000;font-size:14px;font-weight:700;padding:16px 32px;border-radius:10px;text-decoration:none;">Start Playing →</a>
    </div>
  `);
  return sendEmail({ to: user.email, subject: `Welcome to PadelPro, ${user.name}! 🎾`, html });
};
