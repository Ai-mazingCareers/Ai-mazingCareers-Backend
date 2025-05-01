const mongoose= require('mongoose');
const axios = require('axios'); // Ensure axios is installed for making HTTP requests
const { client, connectToDatabase } = require('../config/connection');  
const job = require('../models/job'); // Import the resume schema

// get all jobs
async function getAllJobs(req, res) {

  try {
    
    const db = client.db('Recruiter'); // Connect to the 'Recruiter' database
    const collection = db.collection('job-info'); // Access the 'job-info' collection

    // Find jobs associated with the provided email
    const jobs = await collection.find({}).toArray();

    if (!jobs || jobs.length === 0) {
      return res.status(404).json({ message: 'Jobs not found' });
    }

    res.status(200).json(jobs);
  } catch (err) {
    console.error('Error retrieving jobs:', err);
    res.status(500).json({ message: 'Error retrieving jobs', error: err.message });
  }
}

// get the searched job 
const getSearchedJob = async (req, res) => {
  try {
    const { keyword, email } = req.query; // Extract query parameters

    await connectToDatabase()

    // Connect to the 'Recruiter' database
    const db = client.db('Recruiter');
    const collection = db.collection('job-info');
    
    // // Create a RegExp object using the pattern
    const processedKeyword = keyword.toLowerCase().split('%');
    const regexPatterns = processedKeyword
      .map(word => `(?=.*\\b${word.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, '\\$&')}\\b)`)
      .join('');
    
    // Query to search for jobs matching the generalized keyword in job_title
    const query = { job_title: { $regex: regexPatterns, $options: 'i' } }; 
    
    // Fetch matching jobs
    const jobs = await collection.find(query).toArray();

    if (!jobs.length) {
      return res.status(404).json({ message: "No jobs found for the given keyword" });
    }

    // Calculate ATS scores for each job
    const filteredJobs = await Promise.all(
      jobs.map(async (job) => {
        try {
          // Await the ATS score API call
          const atsScoreResponse = await axios.get(`http://localhost:5000/api/ats-score?email=${email}&_id=${job._id}`);
          const atsScore = atsScoreResponse.data.score; // Assuming the ATS score is in the 'score' field

          
          // Return job object with ATS score
          return { ...job, atsScore };
        } catch (error) {
          console.error(`Error fetching ATS score for job ID ${job._id}:`, error.message);
          // Return job object with atsScore as null in case of error
          return { ...job, atsScore: null };
        }
      })
    );
    // Sort jobs by ATS score in descending order
    const sortedJobs = filteredJobs.sort((a, b) => (b.atsScore || 0) - (a.atsScore || 0));    res.status(200).json(sortedJobs);
   
  } catch (err) {
    console.error("Error fetching searched jobs:", err);
    res.status(500).json({ message: "Error fetching searched jobs", error: err.message });
  }
};


module.exports = { getAllJobs, getSearchedJob};
