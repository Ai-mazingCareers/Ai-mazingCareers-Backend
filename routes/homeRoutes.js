const express = require("express");
const { getAllJobs, getSearchedJob} = require("../controllers/homeController");
// const { get } = require("mongoose");
const router = express.Router();


router.get("/", getAllJobs);

router.get("/search", getSearchedJob);

module.exports = router;
