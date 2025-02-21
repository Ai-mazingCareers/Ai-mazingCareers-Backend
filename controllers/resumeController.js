const mongoose = require('mongoose');
const { client, connectToDatabase } = require('../config/connection');  
const Resume = require('../models/resume'); // Import the resume schema

// Create a connection to the Seeker database
const seekerDb = mongoose.createConnection(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ai-mazingcareers.kns0c.mongodb.net/Seeker?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Use the schema with the specific connection
const SeekerResume = seekerDb.model('Resume', Resume.schema,'resume-info');

// Function to insert resume information
async function resumeInfo(req, res) {
  const resumeData = req.body; // Extract data from the request body
  const { email } = resumeData;
  try {
    // Use the model to validate and insert the data
    
    const existingResume = await SeekerResume.findOne({ email });

    if (existingResume) {
      return res.status(400).json({ message: 'A resume with this email already exists.' });
    }
    const result = await SeekerResume.create(resumeData);

    res.status(201).json({
      message: 'Resume inserted successfully',
      insertedId: result._id, // Return the inserted document's ID
    });
  } catch (err) {
    console.error('Error inserting resume:', err);
    res.status(500).json({
      message: 'Error inserting resume',
      error: err.message,
    });
  }
}


async function getResume(req, res) {
  const email = req.query.email; // Extract email from query parameters

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email query parameter is required' });
    }

    const db = client.db('Seeker'); // Connect to the 'Seeker' database
    const collection = db.collection('resume-info'); // Access the 'resume-info' collection

    // Find the resume with the provided email
    const resume = await collection.findOne({ email });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    res.status(200).json(resume);
  } catch (err) {
    console.error('Error retrieving resume:', err);
    res.status(500).json({ message: 'Error retrieving resume', error: err.message });
  }
}

module.exports = { resumeInfo, getResume };