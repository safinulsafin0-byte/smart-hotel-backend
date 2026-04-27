const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log("❌ DB Error:", err));

// --- রেজিস্ট্রেশন রাউট ---
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // এখানে আমরা সরাসরি মঙ্গোডিবির একটি কালেকশনে ডেটা রাখব
    // আপনি যদি Schema ব্যবহার না করতে চান, তবে সরাসরি collection ব্যবহার করা যায়
    const user = await mongoose.connection.collection('users').insertOne({
      name,
      email,
      password, // প্রোডাকশনে পাসওয়ার্ড হ্যাশ করা উচিত
      createdAt: new Date()
    });

    res.status(201).json({ 
      message: "Hotel Created Successfully!", 
      user: { name, email },
      token: "dummy-jwt-token-for-now" // ফ্রন্টএন্ড টোকেন আশা করছে
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

// --- লগইন রাউট ---
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await mongoose.connection.collection('users').findOne({ email, password });

    if (user) {
      res.status(200).json({ message: "Login successful", user, token: "dummy-jwt-token" });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

app.get('/', (req, res) => {
  res.send("SmartHotel SaaS Backend is Live!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});