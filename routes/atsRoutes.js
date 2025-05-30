const express = require("express");
const { calculateATS } = require("../controllers/atsController");
const router = express.Router();

// POST route for ATS scoring
router.get("/", calculateATS);

module.exports = router;
