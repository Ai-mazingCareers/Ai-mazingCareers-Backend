const express = require("express");
const { applyForJob, getAppliedJobs, getApplicantsForJob} = require("../controllers/applicationController");
const router = express.Router();

// POST route for ATS scoring
router.post("/", applyForJob);
router.get("/applied-jobs", getAppliedJobs);
router.get("/applicants", getApplicantsForJob);



module.exports = router;
