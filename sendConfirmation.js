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

  // রেন্ডার-বান্ধব কনফিগারেশন
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
      user: 'safinulsafin0@gmail.com',
      pass: process.env.EMAIL_PASS,
    },
    // এই অংশটুকু রেন্ডারের নেটওয়ার্ক ইস্যু হ্যান্ডেল করার জন্য জরুরি
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2'
    },
    connectionTimeout: 10000, // ১০ সেকেন্ড টাইমআউট
    greetingTimeout: 5000
  });

  const mailOptions = {
    from: '"SmartHotel" <safinulsafin0@gmail.com>',
    to: guest_email,
    subject: `Booking Confirmed — ${room_name ?? 'Your Stay'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color:#1d6fb8; text-align: center;">Booking Confirmed ✅</h2>
        <p>Hi <strong>${guest_name}</strong>,</p>
        <p>Your booking details are as follows:</p>
        <hr>
        <p><strong>Booking ID:</strong> ${booking_id}</p>
        <p><strong>Room:</strong> ${room_name ?? '-'}</p>
        <p><strong>Check-in:</strong> ${check_in}</p>
        <p><strong>Check-out:</strong> ${check_out}</p>
        <p><strong>Price:</strong> ৳${total_price}</p>
        <hr>
        <p>See you soon!</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('❌ Final Error Log:', error);
    // যদি রেন্ডার একদমই কানেক্ট করতে না দেয়, আমরা এরর মেসেজটা ফ্রন্টএন্ডে পাঠিয়ে দিচ্ছি
    return res.status(500).json({ error: "Email server unreachable: " + error.message });
  }
});

module.exports = router;