const express = require("express");
const { resumeInfo, getResume } = require("../controllers/resumeController");
// const { get } = require("mongoose");
const router = express.Router();

// POST route for ATS scoring
router.post("/", resumeInfo);

// router.get("/", getResume);

module.exports = router;
