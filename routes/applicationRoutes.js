const express = require("express");
const { applyForJob, getAppliedJobs} = require("../controllers/applicationController");
const router = express.Router();

// POST route for ATS scoring
router.post("/", applyForJob);
router.get("/applied-jobs", getAppliedJobs);



module.exports = router;
