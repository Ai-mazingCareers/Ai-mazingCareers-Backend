const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Import routes
const atsRoutes = require("./routes/atsRoutes");
app.use("/api", atsRoutes);

// Start server
app.listen(port, () => {
  console.log(`Backend running at http://localhost:${port}`);
});
