const express = require('express'); // এই লাইনটি না থাকায় এরর আসছিল
const cors = require('cors');
const dotenv = require('dotenv');
const sendConfirmationRouter = require('./routes/sendConfirmation');

// configuration
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// routes
app.use(sendConfirmationRouter);

app.get('/', (req, res) => {
  res.send('SmartHotel Backend is Running 🚀');
});

// server listen
app.listen(PORT, () => {
  console.log(`🚀 Server on: http://localhost:${PORT}`);
});