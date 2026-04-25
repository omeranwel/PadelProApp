import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ Email credentials missing. Skipping email.');
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"PadelPro" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log('📧 Message sent: %s', info.messageId);
    return info;
  } catch (err) {
    console.error('❌ Email failed:', err.message);
  }
};

export const sendBookingConfirmation = async (user, booking) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #FF5A1F;">Booking Confirmed! 🎾</h2>
      <p>Hi ${user.name}, your court booking at <strong>${booking.courtName}</strong> is confirmed.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Date:</strong> ${booking.date}</p>
        <p style="margin: 5px 0;"><strong>Time:</strong> ${booking.startTime} (${booking.duration}h)</p>
        <p style="margin: 5px 0;"><strong>Location:</strong> ${booking.courtArea}</p>
        <p style="margin: 5px 0;"><strong>Total Paid:</strong> Rs ${booking.totalAmount}</p>
      </div>
      <p>Need to change something? You can reschedule or cancel directly from your profile dashboard.</p>
      <p style="color: #666; font-size: 12px; margin-top: 40px;">&copy; 2026 PadelPro Karachi. All rights reserved.</p>
    </div>
  `;
  return await sendEmail({ to: user.email, subject: `Booking Confirmed - ${booking.courtName}`, html });
};

export const sendRescheduleConfirmation = async (user, booking) => {
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #3B82F6;">Booking Modified</h2>
      <p>Hi ${user.name}, your booking for <strong>${booking.courtName}</strong> has been successfully rescheduled.</p>
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>New Date:</strong> ${booking.date}</p>
        <p style="margin: 5px 0;"><strong>New Time:</strong> ${booking.startTime}</p>
      </div>
      <p>We look forward to seeing you on the court!</p>
      <p style="color: #666; font-size: 12px; margin-top: 40px;">&copy; 2026 PadelPro Karachi. All rights reserved.</p>
    </div>
  `;
  return await sendEmail({ to: user.email, subject: `Booking Rescheduled - ${booking.courtName}`, html });
};
