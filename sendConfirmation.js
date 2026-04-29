const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// ট্রান্সপোর্টার সেটআপ
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "safinulsafin0@gmail.com",
    pass: process.env.EMAIL_PASS, // রেন্ডারে সেট করা App Password
  },
  // কানেকশন স্ট্যাবিলিটির জন্য কিছু এক্সট্রা সেটিংস
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

router.post('/api/send-confirmation', async (req, res) => {
  const { guest_name, guest_email, room_name, check_in, check_out, total_price } = req.body;

  if (!guest_email) {
    return res.status(400).json({ error: "Guest email is missing" });
  }

  const mailOptions = {
    from: '"SmartHotel" <safinulsafin0@gmail.com>',
    to: guest_email,
    subject: `Booking Confirmed ✅ — ${room_name || 'Your Room'}`,
    html: `<h2>Confirmation</h2><p>Hi ${guest_name}, your booking is confirmed for ${room_name}.</p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email success:", info.messageId);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("❌ Email error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;