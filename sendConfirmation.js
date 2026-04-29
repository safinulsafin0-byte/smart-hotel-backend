const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

// Transporter Config with IPv4 Force
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // ৪৬৫ পোর্টের জন্য true
  auth: {
    user: "safinulsafin0@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
  // IPv4 জোর করার জন্য socket লেভেল সেটিংস
  connectionTimeout: 10000,
});

router.post("/api/send-confirmation", async (req, res) => {
  try {
    const booking = req.body;
    
    if (!booking.guest_email) {
      return res.status(400).json({ success: false, message: "Guest email is required" });
    }

    await transporter.sendMail({
      from: `"Smart Hotel" <safinulsafin0@gmail.com>`,
      to: booking.guest_email,
      subject: `Your booking is confirmed — ${booking.room_name || 'Room'}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
          <h2 style="color: #1d6fb8;">Booking Confirmed ✅</h2>
          <p>Hello <strong>${booking.guest_name}</strong>,</p>
          <p>Your booking has been confirmed successfully.</p>
          <hr>
          <p><strong>Room:</strong> ${booking.room_name || "N/A"}</p>
          <p><strong>Check-in:</strong> ${booking.check_in}</p>
          <p><strong>Check-out:</strong> ${booking.check_out}</p>
          <p><strong>Total:</strong> ৳${booking.total_price}</p>
          <hr>
          <p>Thank you for staying with us!</p>
        </div>
      `,
    });

    console.log("✅ Confirmation email sent to:", booking.guest_email);
    return res.status(200).json({
      success: true,
      message: "Confirmation email sent",
    });

  } catch (error) {
    console.error("❌ Email send failed:", error);
    return res.status(500).json({
      success: false,
      message: "Email send failed",
      error: error.message,
      code: error.code,
    });
  }
});

module.exports = router;