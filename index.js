const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt'); // পাসওয়ার্ড সিকিউরিটির জন্য
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected Successfully"))
  .catch(err => console.log("❌ DB Error:", err));

// --- ১. রেজিস্ট্রেশন রাউট (With Password Hashing) ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // পাসওয়ার্ড হ্যাশ করা (যাতে ডাটাবেস অ্যাডমিনও পাসওয়ার্ড না জানে)
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await mongoose.connection.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      isPremium: false, // ডিফল্টভাবে ফ্রি ইউজার
      createdAt: new Date()
    });

    res.status(201).json({ 
      message: "Hotel Created Successfully!", 
      user: { name, email },
      token: "dummy-jwt-session-active" 
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// --- ২. লগইন রাউট ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await mongoose.connection.collection('users').findOne({ email });

    if (user && await bcrypt.compare(password, user.password)) {
      res.status(200).json({ message: "Login successful", user, token: "dummy-jwt-session-active" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

// --- ৩. নগদের অটোমেটিক পেমেন্ট ওয়েবহুক (Automatic) ---
// এই URL টি তোমার ফোনে SMS Forwarder অ্যাপে সেট করবে
app.post('/api/nagad-webhook', async (req, res) => {
  const { text, from } = req.body; // SMS Forwarder অ্যাপ সাধারণত 'text' হিসেবে মেসেজ পাঠায়
  const message = text || "";

  console.log("📩 New SMS Received from:", from);
  console.log("Content:", message);

  // নগদের অফিসিয়াল মেসেজ ফরম্যাট চেক করা
  if (message.includes("Nagad") && message.includes("TrxID")) {
    try {
      // Regex দিয়ে TrxID এবং টাকার পরিমাণ বের করা
      const trxMatch = message.match(/TrxID:\s*(\w+)/);
      const amountMatch = message.match(/Amount:\s*Tk\s*([\d.]+)/);

      if (trxMatch && amountMatch) {
        const trxID = trxMatch[1];
        const amount = parseFloat(amountMatch[1]);

        // ডাটাবেসে পেমেন্ট রেকর্ড আপডেট বা তৈরি (Upsert)
        await mongoose.connection.collection('payments').updateOne(
          { trxID: trxID },
          { 
            $set: { 
              status: 'success', 
              amount: amount, 
              sender: from, 
              receivedAt: new Date(),
              rawSMS: message 
            } 
          },
          { upsert: true }
        );

        console.log(`💰 Payment Confirmed! TrxID: ${trxID}, Amount: ${amount} TK`);
        return res.status(200).send("Verified Successfully");
      }
    } catch (err) {
      console.error("❌ Processing Error:", err);
    }
  }
  res.status(400).send("Invalid SMS Format");
});

// --- ৪. হোটেলের বুকিং বা অন্য ডেটা সেভ করার রাউট ---
app.post('/api/bookings', async (req, res) => {
  try {
    const booking = await mongoose.connection.collection('bookings').insertOne({
      ...req.body,
      createdAt: new Date()
    });
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: "Booking failed" });
  }
});

// --- ডিফল্ট রাউট ---
app.get('/', (req, res) => {
  res.send("SmartHotel SaaS Backend is Live & Protected!");
});

// --- সার্ভার স্টার্ট ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});