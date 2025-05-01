const express = require("express");
const { applyForJob, getAppliedJobs, getPostedJobs} = require("../controllers/applicationController");
const router = express.Router();

// POST route for ATS scoring
router.post("/", applyForJob);
router.post("/applied-jobs", getAppliedJobs);
router.post("/posted-jobs", getPostedJobs);



module.exports = router;
