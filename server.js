const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const { client, connectToDatabase} = require('./config/connection.js');
const {restrictToLoggedInUsers} = require("./middleware/auth");
// Load environment variables
dotenv.config();

const app = express();
// Connect to the database
connectToDatabase();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
// Import routes

 const userRoutes = require("./routes/userRoutes");
app.use("/api/user", userRoutes);

const atsScoreRoutes = require("./routes/atsScoreRoutes");
app.use("/api/check-ats-score", atsScoreRoutes);

const atsRoutes = require("./routes/atsRoutes");
app.use("/api/ats-score", atsRoutes);

const resumeRoutes = require("./routes/resumeRoutes");
app.use("/api/resume", resumeRoutes);

const jobRoutes = require("./routes/jobRoutes");
app.use("/api/job", jobRoutes);

const applicationRoutes = require("./routes/applicationRoutes");
app.use("/api/apply", applicationRoutes);

// fetch all jobs route
const homeRoutes = require("./routes/homeRoutes");
app.use("/api/home", homeRoutes);


// Start server
const server = app.listen(process.env.PORT, () => {
  console.log(`Backend running at http://localhost:${process.env.PORT}`);
});


process.on('SIGINT', async () => {
  console.log('\n🔌 Shutting down gracefully...');
  await client.close();
  console.log('❎ MongoDB connection closed');
  server.close(() => {
    console.log('🛑 Server stopped');
    process.exit(0);
  });
});




