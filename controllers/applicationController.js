const { ObjectId } = require('mongodb');
const { client } = require('../config/connection'); 

const applyForJob = async (req, res) => {
  const { email, job_id } = req.body;

  if (!email || !job_id) {
    return res.status(400).json({ message: 'email and job_id are required' });
  }

  if (!ObjectId.isValid(job_id)) {
    return res.status(400).json({ message: 'Invalid job_id format' });
  }

  const jobObjectId = new ObjectId(job_id);

  try {
    // 1. Connect to the Recruiter DB to check if job exists
    const recruiterDb = client.db('Recruiter');
    const jobExists = await recruiterDb.collection('job-info').findOne({ _id: jobObjectId });

    if (!jobExists) {
      return res.status(404).json({ message: 'Job not found ❌' });
    }

    // 2. Connect to User DB
    const userDb = client.db('User');
    const appliedCollection = userDb.collection('applied-info');
    const applicationCollection = userDb.collection('application-info');

    // 3. Check if user has already applied for this job
    const alreadyApplied = await appliedCollection.findOne({
      email,
      applied_jobs: jobObjectId
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: 'Already applied to this job ⚠️' });
    }

    // 4. Update applied-info (map job to email)
    await appliedCollection.updateOne(
      { email },
      { $addToSet: { applied_jobs: jobObjectId } },
      { upsert: true }
    );

    // 5. Update application-info (map email to job)
    await applicationCollection.updateOne(
      { job_id: jobObjectId },
      { $addToSet: { applicants: email } },
      { upsert: true }
    );

    return res.status(200).json({ message: 'Applied successfully ✅' });

  } catch (error) {
    console.error('❌ Error Applying to the job:', error);
    return res.status(500).json({ message: 'Error applying to job', error: error.message });
  }
};



const getAppliedJobs = async (req, res) => {
  const { email } = req.query; // Use query parameters for GET request

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // 1. Connect to User DB to get job IDs
    const userDb = client.db('User');
    const appliedCollection = userDb.collection('applied-info');

    const userApplications = await appliedCollection.findOne({ email });

    if (!userApplications || !userApplications.applied_jobs || userApplications.applied_jobs.length === 0) {
      return res.status(200).json({ message: 'No jobs applied yet', jobs: [] });
    }

    // 2. Connect to Recruiter DB to fetch job details
    const recruiterDb = client.db('Recruiter');
    const jobCollection = recruiterDb.collection('job-info');

    const jobs = await jobCollection
      .find({ _id: { $in: userApplications.applied_jobs } })
      .toArray();

    return res.status(200).json({ message: 'Applied jobs fetched successfully ✅', jobs });

  } catch (error) {
    console.error('❌ Error fetching applied jobs:', error);
    return res.status(500).json({ message: 'Error fetching applied jobs', error: error.message });
  }
};



const getPostedJobs = async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // 1. Connect to Recruiter DB
    const recruiterDb = client.db('Recruiter');
    const jobCollection = recruiterDb.collection('job-info');

    // 2. Find jobs where recruiter_email matches the provided email
    const postedJobs = await jobCollection.find({ job_posted_by: email }).toArray();

    if (postedJobs.length === 0) {
      return res.status(200).json({ message: 'No jobs posted yet', jobs: [] });
    }

    return res.status(200).json({ message: 'Posted jobs fetched successfully ✅', jobs: postedJobs });

  } catch (error) {
    console.error('❌ Error fetching posted jobs:', error);
    return res.status(500).json({ message: 'Error fetching posted jobs', error: error.message });
  }
};

module.exports = { applyForJob, getAppliedJobs, getPostedJobs };
