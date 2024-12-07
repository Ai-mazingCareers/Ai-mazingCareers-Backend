const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const { client, connectToDatabase} = require('./config/connection.js');
// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Connect to the database
connectToDatabase();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import routes
const atsRoutes = require("./routes/atsRoutes");
app.use("/api/ats-score", atsRoutes);

const resumeRoutes = require("./routes/resumeRoutes");
app.use("/api/resume", resumeRoutes);

// Start server
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
