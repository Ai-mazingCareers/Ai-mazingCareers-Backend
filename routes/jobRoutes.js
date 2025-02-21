const express = require("express");
const { jobInfo ,getJobs, getOneJob } = require("../controllers/jobController");
const router = express.Router();

// POST route for handling Jobs 
router.post("/", jobInfo);

router.get("/",getJobs);

router.get("/one",getOneJob);

module.exports = router;
