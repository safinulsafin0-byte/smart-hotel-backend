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

  // ইমেইল চেক
  if (!guest_email) {
    return res.status(400).json({ error: 'guest_email is required' });
  }

  // রেন্ডার সার্ভারের জন্য ৫8৭ পোর্ট কনফিগারেশন
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // ৫8৭ পোর্টের জন্য false ই রাখতে হবে
    requireTLS: true, // TLS কানেকশন নিশ্চিত করার জন্য
    auth: {
      user: 'safinulsafin0@gmail.com',
      pass: process.env.EMAIL_PASS, // রেন্ডারে সেট করা ১৬ ডিজিটের পাসওয়ার্ড
    },
    tls: {
      rejectUnauthorized: false // অনেক সময় সার্টিফিকেট ইস্যু এড়াতে এটি সাহায্য করে
    }
  });

  const mailOptions = {
    from: '"SmartHotel" <safinulsafin0@gmail.com>',
    to: guest_email,
    subject: `Booking Confirmed — ${room_name ?? 'Your Room'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
        <h1 style="color:#1d6fb8; text-align: center;">Booking Confirmed ✅</h1>
        <p>Hi <strong>${guest_name}</strong>,</p>
        <p>Great news! Your booking at <strong>SmartHotel</strong> has been approved. Here are your details:</p>
        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
          <tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;"><strong>Booking ID:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${booking_id}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Room:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${room_name ?? '-'}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-in:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${check_in}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Check-out:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${check_out}</td></tr>
          <tr style="background: #f9f9f9;"><td style="padding: 10px; border: 1px solid #ddd;"><strong>Guests:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">${guests_count}</td></tr>
          <tr><td style="padding: 10px; border: 1px solid #ddd;"><strong>Total Amount:</strong></td><td style="padding: 10px; border: 1px solid #ddd;">৳${total_price}</td></tr>
        </table>
        <p style="margin-top:20px;">If you have any questions, feel free to contact us.</p>
        <p>Thank you for choosing us!</p>
        <hr style="border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #999; text-align: center;">This is an automated email from SmartHotel System.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('❌ Email send failed:', error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;