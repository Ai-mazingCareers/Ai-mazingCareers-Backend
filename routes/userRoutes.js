const express = require("express");
const {userSignup, userLogin } = require("../controllers/userController");
const router = express.Router();

// POST route for handling Resume
router.post("/", userSignup);
router.post("/login", userLogin);

module.exports = router;