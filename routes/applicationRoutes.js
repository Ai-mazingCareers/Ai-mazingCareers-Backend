const express = require("express");
const { applyForJob, getAppliedJobs, getPostedJobs} = require("../controllers/applicationController");
const router = express.Router();

// POST route for ATS scoring
router.post("/", applyForJob);
router.get("/applied-jobs", getAppliedJobs);
router.get("/posted-jobs", getPostedJobs);



module.exports = router;
