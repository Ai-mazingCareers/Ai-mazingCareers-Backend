const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const {setUser, getUser} = require("../utils/auth")
const User = require('../models/user'); // Import the resume schema


const userDb = mongoose.createConnection(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ai-mazingcareers.kns0c.mongodb.net/User?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const signup = userDb.model('User', User.schema,'user-info');

async function userSignup(req, res) {

    try {
      
        const {name, email, password} = req.body;

        const result = await signup.create({name, email, password});

        res.status(201).json({
            message: 'Signed up successfully',
            insertedId: result._id, // Return the inserted document's ID
          });
      
    } catch (err) {
        console.error('Error signinp up', err);
    res.status(500).json({
      message: 'Error signinp up',
      error: err.message,
    });
      
    }
  }

  async function userLogin(req, res) {
    try {
      const { email, password } = req.body;
  
      const user = await signup.findOne({ email, password });

      if(!user){
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      
      const token = setUser(user);
      console.log("token>>>>>>>>>>", token);
      console.log("User>>>>>>>", user);
      res.cookie("uid", token);
      return res.json({ message: 'Login successful', user });

    } catch (err) {
        console.error('Error logging in', err);
        res.status(500).json({
          message: 'Error logging in',
          error: err.message,
        });
    }
}

  module.exports = { userSignup, userLogin };
  