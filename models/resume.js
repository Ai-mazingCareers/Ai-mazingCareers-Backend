const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Compulsory
  email: { type: String, required: true }, // Compulsory
  mobile: { type: String, required: true }, // Compulsory
  objective: { type: String }, // Optional
  education: [{
    degree: { type: String, required: true }, // Compulsory
    field: { type: String, required: true }, // Compulsory
    institute: { type: String, required: true }, // Compulsory
    start_year: { type: Number, required: true }, // Compulsory
    end_year: { type: Number, required: true }, // Compulsory
    cgpa: { type: Number, required: true } // Compulsory
  }],
  experience: [{
    title: { type: String, required: function() { return this.experience && this.experience.length > 0; } }, // Mandatory if experience is added
    role: { 
      type: String, 
      enum: ['Intern', 'Part-time', 'Full-time'], 
      required: function() { return this.experience && this.experience.length > 0; } 
    },
    company: { type: String, required: function() { return this.experience && this.experience.length > 0; } },
    start_date: { type: Date, required: function() { return this.experience && this.experience.length > 0; } },
    end_date: { type: Date, required: function() { return this.experience && this.experience.length > 0; } }
  }],
  skills: [{ type: String, required: true }], // Compulsory
  certifications: [{
    name: { type: String },
    issuing_organization: { type: String }
  }]
});

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
