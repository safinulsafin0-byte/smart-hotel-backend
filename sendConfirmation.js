// routes/sendConfirmation.js (or wherever you mount routes)
const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/api/send-confirmation', async (req, res) => {
  const {
    booking_id,
    guest_name,
    guest_email,
    room_name,
    check_in,
    check_out,
    guests_count,
    total_price,
  } = req.body;

  if (!guest_email) {
    return res.status(400).json({ error: 'guest_email is required' });
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // ৫৮৭ পোর্টের জন্য এটা false হবে
    auth: {
      user: 'safinulsafin0@gmail.com',
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: '"SmartHotel" <safinulsafin0@gmail.com>',
    to: guest_email,
    subject: `Booking Confirmed — ${room_name ?? 'Your Room'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h1 style="color:#1d6fb8;">Booking Confirmed ✅</h1>
        <p>Hi ${guest_name},</p>
        <p>Your booking has been approved. Details below:</p>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td><strong>Booking ID:</strong></td><td>${booking_id}</td></tr>
          <tr><td><strong>Room:</strong></td><td>${room_name ?? '-'}</td></tr>
          <tr><td><strong>Check-in:</strong></td><td>${check_in}</td></tr>
          <tr><td><strong>Check-out:</strong></td><td>${check_out}</td></tr>
          <tr><td><strong>Guests:</strong></td><td>${guests_count}</td></tr>
          <tr><td><strong>Total:</strong></td><td>৳${total_price}</td></tr>
        </table>
        <p style="margin-top:20px;">Thank you for choosing us!</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Email send failed:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
