const dns = require("dns");
dns.setDefaultResultOrder("ipv4first"); 
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); 

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ DB Connection Error:", err));

// --- Email Config (Nodemailer) ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'safinulsafin0@gmail.com', // তোমার ইমেইল
        pass: process.env.EMAIL_PASS   // .env ফাইলে তোমার ১৬ ডিজিটের App Password রাখবে
    }
});

// --- Routes ---

// ১. রুম অ্যাড করা (৫টি ছবির লিংকসহ)
app.post('/api/rooms', async (req, res) => {
    try {
        const { roomNumber, type, price, description, images } = req.body;
        const room = await mongoose.connection.collection('rooms').insertOne({
            roomNumber,
            type,
            price: parseFloat(price),
            description,
            images, // Array of 5 image URLs
            status: 'Available',
            createdAt: new Date()
        });
        res.status(201).json({ message: "Room added successfully!", roomId: room.insertedId });
    } catch (err) {
        res.status(500).json({ message: "Error adding room", error: err.message });
    }
});

// ২. সব রুম দেখা
app.get('/api/rooms', async (req, res) => {
    const rooms = await mongoose.connection.collection('rooms').find().toArray();
    res.json(rooms);
});

// ৩. বুকিং কনফার্ম করা এবং ইমেইল পাঠানো
app.post('/api/bookings/approve', async (req, res) => {
    const { bookingId, userEmail, customerName, roomNumber } = req.body;

    try {
        // ডাটাবেসে বুকিং স্ট্যাটাস আপডেট
        await mongoose.connection.collection('bookings').updateOne(
            { _id: new mongoose.Types.ObjectId(bookingId) },
            { $set: { status: 'Confirmed' } }
        );

        // ইউজারকে ইমেইল পাঠানো
        const mailOptions = {
            from: '"HotelPoint Admin" <safinulsafin0@gmail.com>',
            to: userEmail,
            subject: 'Your Booking is Confirmed! 🏨',
            html: `
                <h3>Hello ${customerName},</h3>
                <p>Great news! Your booking for <b>Room ${roomNumber}</b> has been approved.</p>
                <p>We are looking forward to hosting you. Thank you for choosing HotelPoint!</p>
                <br>
                <p>Best Regards,<br><b>HotelPoint Team</b></p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Email error:", error);
                return res.status(500).json({ message: "Approved but email failed." });
            }
            res.status(200).json({ message: "Booking Approved and Email Sent!" });
        });

    } catch (err) {
        res.status(500).json({ message: "Approval process failed." });
    }
});

// ৪. ইউজার রেজিস্ট্রেশন
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;
    await mongoose.connection.collection('users').insertOne({ name, email, password, createdAt: new Date() });
    res.status(201).json({ message: "User Registered!" });
});

// ৫. ইউজার লগইন
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await mongoose.connection.collection('users').findOne({ email, password });
    if (user) res.json({ message: "Success", user });
    else res.status(401).json({ message: "Invalid credentials" });
});

app.get('/', (req, res) => res.send("HotelPoint Backend is running fine!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on: http://localhost:${PORT}`));
const sendConfirmation = require('./sendConfirmation'); // ফাইলের পাথ অনুযায়ী
app.use('/', sendConfirmation);