const mongoose= require('mongoose');
const { ObjectId } = require('mongodb');

const { client, connectToDatabase } = require('../config/connection');  
const job = require('../models/job'); // Import the resume schema


// Create a connection to the Recruiter database
const RecruiterDb = mongoose.createConnection(
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@ai-mazingcareers.kns0c.mongodb.net/Recruiter?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

// Use the schema with the specific connection
const Jobsinfo = RecruiterDb.model('job-info', job.schema, "job-info");

// posting data to the database

// Function to insert Jobs information
async function jobInfo(req, res) {
  const jobsData = req.body; // Extract data from the request body
  try {
    // Use the model to validate and insert the data
    const result = await Jobsinfo.create(jobsData);

    res.status(201).json({
      message: 'Job inserted successfully',
      insertedId: result._id, // Return the inserted document's ID
    });
  } catch (err) {
    console.error('Error inserting job:', err);
    res.status(500).json({
      message: 'Error inserting job',
      error: err.message,
    });
  }
}

// get [data from jobs database] i.e. jobs specific to the recruiter
async function getJobs(req, res) {
  const job_posted_by = req.query.job_posted_by; // Extract email from query parameters

  try {
    if (!job_posted_by) {
      return res.status(400).json({ message: 'job_posted_by query parameter is required' });
    }

    const db = client.db('Recruiter'); // Connect to the 'Recruiter' database
    const collection = db.collection('job-info'); // Access the 'job-info' collection

    // Find jobs associated with the provided email
    const jobs = await collection.find({ job_posted_by }).toArray();

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: 'Jobs not found' });
    }

    res.status(200).json(jobs);
  } catch (err) {
    console.error('Error retrieving jobs:', err);
    res.status(500).json({ message: 'Error retrieving jobs', error: err.message });
  }
}
async function getOneJob(req, res) {
  const job_id = req.query._id; // Extract job_id from query parameters

  try {
    if (!job_id) {
      return res.status(400).json({ message: '_id query parameter is required' });
    }

    const db = client.db('Recruiter'); // Connect to the 'Recruiter' database
    const collection = db.collection('job-info'); // Access the 'job-info' collection

    // Find the job associated with the provided _id
    const job = await collection.findOne({ _id: new ObjectId(job_id) });

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.status(200).json(job);
  } catch (err) {
    console.error('Error retrieving job:', err);
    res.status(500).json({ message: 'Error retrieving job', error: err.message });
  }
}


module.exports = { jobInfo , getJobs , getOneJob};
