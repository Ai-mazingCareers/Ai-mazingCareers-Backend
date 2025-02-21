const express = require("express");
const router = express.Router();
const { checkAtsScore } = require("../controllers/atsScoreController"); // Import the controller

const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

// Define the ATS score route
router.post("/", upload.single("resume"), checkAtsScore);

module.exports = router;
