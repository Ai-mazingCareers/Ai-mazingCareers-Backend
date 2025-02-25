const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const {setUser, getUser} = require("../utils/auth")
const User = require("../models/user"); // Import the user schema

// Create a connection to the User database
const userDb = mongoose.createConnection(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ai-mazingcareers.kns0c.mongodb.net/User?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const signup = userDb.model("User", User.schema, "user-info");

/**
 * User Signup - Secure Registration
 */
async function userSignup(req, res) {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if the user already exists
    const existingUser = await signup.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new signup({ name, email, password: hashedPassword });
    const result = await newUser.save();

    res.status(201).json({
      message: "Signed up successfully",
      userId: result._id,
    });
  } catch (err) {
    console.error("Error signing up", err);
    res.status(500).json({
      message: "Error signing up",
      error: err.message,
    });
  }
}

/**
 * User Login - Secure Authentication
 */
async function userLogin(req, res) {
  try {
    const { email, password } = req.body;
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await signup.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = setUser(user);
    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("Error logging in", err);
    res.status(500).json({
      message: "Error logging in",
      error: err.message,
    });
  }
}

async function userLogout(req, res) {
  try {
      logoutUser(res);
  } catch (err) {
      console.error("Error logging out", err);
      res.status(500).json({
          message: "Error logging out",
          error: err.message,
      });
  }
}

module.exports = { userSignup, userLogin, userLogout };
