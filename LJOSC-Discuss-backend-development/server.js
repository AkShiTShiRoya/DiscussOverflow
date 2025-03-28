
const { createClient } = require('redis'); // For CommonJS syntax



require("dotenv").config(); // Ensure this is at the top

const express = require("express");
const mongoose = require("mongoose");
const authMiddleware = require("./middleware/authentication");
const authRouter = require("./routes/auth");
const indexRoute = require("./routes/index");
const apiRoute = require("./routes/api");
const cors = require("cors");
const rateLimit = require('express-rate-limit');
const redis = require('redis');

const app = express();
const SERVER_PORT = process.env.SERVER_PORT || 3000;  // Use SERVER_PORT or default to 3000
// const DATABASE_URL = process.env.DATABASE_URL;  
const DATABASE_URL = process.env.MONGO_URI; // Correct variable reference

//       // Correct variable reference

// MongoDB Connection
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is missing in .env file.");
  process.exit(1); // Exit if no database URL is found
}

mongoose.connect(DATABASE_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Exit the app if DB connection fails
  });

app.use(express.json());

// CORS Configuration
const corsOptions = {
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
};

app.use(cors(corsOptions));

// API Rate Limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 100,
  keyGenerator: (req) => req.ip, // Use IP address as the key
});

app.use(limiter);

// Routes
app.use("/auth", authRouter); // Unprotected
app.use("/", authMiddleware); // Protected routes
app.use("/", indexRoute);
app.use("/api", apiRoute);



 

// Start Server
app.listen(SERVER_PORT, () =>
  console.log(`🚀 Server listening on http://localhost:${SERVER_PORT}`)
);


const redisClient = redis.createClient({
  socket: {
      host: process.env.REDIS_HOST || 'localhost', // Use environment variable or default to localhost
      port: process.env.REDIS_PORT || 6379         // Use environment variable or default to 6379
  }
});

redisClient.on('connect', () => console.log('✅ Connected to Redis'));
redisClient.on('error', (err) => console.error('❌ Error connecting to Redis:', err));

// Connect to Redis
redisClient.connect().catch((err) => {
  console.error('❌ Failed to connect to Redis:', err);
  process.exit(1); // Exit the app if Redis connection fails
});