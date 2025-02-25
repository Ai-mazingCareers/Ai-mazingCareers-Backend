const express = require("express");
const {userSignup, userLogin, userLogout } = require("../controllers/userController");
const router = express.Router();

// POST route for handling Resume
router.post("/signup", userSignup);
router.post("/login", userLogin);
router.post("/logout", userLogout);

module.exports = router;