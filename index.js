const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

dotenv.config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.x86f4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect to MongoDB
    // await client.connect(); 
    console.log("✅ MongoDB Connected Successfully");

    app.get('/', (req, res) => {
      res.send('SmartHotel Backend is Running 🚀');
    });

  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`🚀 Server on: http://localhost:${port}`);
});