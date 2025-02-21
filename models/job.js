const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  job_title: {
    type: String,
    required: true
  },
  company_name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  employment_type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    required: true
  },
  experience_required: {
    minimum_years: {
      type: Number,
      required: true,
      min: 0
    },
    preferred_years: {
      type: Number,
      required: false,
      min: 0
    }
  },
  education_required: [{
    type: String,
    required: true
  }],
  skills_required: [{
    type: String,
    required: true
  }],
  skills_preferred: [{
    type: String,
    required: false
  }],
  responsibilities: [{
    type: String,
    required: true
  }],
  benefits: [{
    type: String,
    required: true
  }],
  certifications_preferred: [{
    type: String,
    required: false
  }],
  job_post_date: {
    type: Date,
    required: true
  },
  application_deadline: {
    type: Date,
    required: true
  },
  salary_range: {
    minimum: {
      type: Number,
      required: true
    },
    maximum: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      required: true,
      enum: ['USD', 'EUR', 'GBP', 'INR'] 
    }
  },
  job_posted_by: {
    type: String,
    required: true,
    match: /.+\@.+\..+/ // Simple regex for email validation
  }
}, { timestamps: true });

const Job = mongoose.model('job-info', jobSchema);

module.exports = Job;
