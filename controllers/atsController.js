// Function to calculate the ATS Score
exports.calculateATS = (req, res) => {
    const { resume, jobDescription } = req.body;
      console.log("res", res);
    // Validate inputs
    if (!resume || !jobDescription) {
      return res.status(400).json({ error: "Resume and Job Description are required!" });
    }
  
    try {
      // Process the ATS Score
      const { score, feedback, missingSkills, missingCertifications, missingEducation } = calculateATSScore(resume, jobDescription);
  
      // Return response with feedback
      return res.status(200).json({
        message: "ATS Score Calculated Successfully",
        score,
        feedback: [
          ...feedback,
          { missingSkills },
          { missingCertifications },
          { missingEducation },
        ],
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "An error occurred while calculating the ATS score." });
    }
  };
  
  // Optimized ATS Scoring Function
  const calculateATSScore = (resume, jobDescription) => {
    let score = 0;
    let feedback = [];
  
    // 1. Experience Match
    const experienceMatch = calculateExperienceMatch(resume.experience, jobDescription.experience_required);
    score += experienceMatch.weightedScore;
    feedback.push(`Experience Match Score: ${experienceMatch.weightedScore.toFixed(2)}%`);
  
    // 2. Skills Match
    const skillsMatch = calculateSkillsMatch(resume.skills, jobDescription.skills_required);
    score += skillsMatch.weightedScore;
    feedback.push(`Matched Skills: ${skillsMatch.matchedSkills.join(", ")}`);
  
    // 3. Certification Match
    const certificationMatch = calculateCertificationsMatch(resume.certifications, jobDescription.certifications_preferred);
    score += certificationMatch.weightedScore;
    feedback.push(`Matched Certifications: ${certificationMatch.matchedCertifications.join(", ")}`);
  
    // 4. Education Match
    const educationMatch = calculateEducationMatch(resume.education, jobDescription.education_required);
    score += educationMatch.weightedScore;
    feedback.push(`Education Match Score: ${educationMatch.weightedScore.toFixed(2)}%`);
  
    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, Math.round(score)));
  
    return {
      score,
      feedback,
      missingSkills: skillsMatch.missingSkills,
      missingCertifications: certificationMatch.missingCertifications,
      missingEducation: educationMatch.missingEducation,
    };
  };
  
  // Helper Functions
  
  // 1. Calculate Experience Match
  const calculateExperienceMatch = (experience, experienceRequired) => {
    const weight = 40; // 40% weight for experience
    let score = 0;
  
    if (!experience || experience.length === 0) {
      return { weightedScore: score };
    }
  
    const totalDuration = experience.reduce((acc, exp) => {
      const startDate = new Date(exp.start_date);
      const endDate = exp.end_date ? new Date(exp.end_date) : new Date();
      const durationInMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
      return acc + durationInMonths;
    }, 0);
  
    const minRequiredDuration = experienceRequired.minimum_years * 12;
    score = Math.min((totalDuration / minRequiredDuration) * weight, weight);
  
    return { weightedScore: score };
  };
  
  // 2. Calculate Skills Match
  const calculateSkillsMatch = (resumeSkills, requiredSkills) => {
    const weight = 30; // 30% weight for skills
    let score = 0;
  
    if (!resumeSkills || !requiredSkills) {
      return { weightedScore: score, matchedSkills: [], missingSkills: requiredSkills || [] };
    }
  
    const matchedSkills = resumeSkills.filter((skill) => requiredSkills.includes(skill));
    const missingSkills = requiredSkills.filter((skill) => !resumeSkills.includes(skill));
  
    score = (matchedSkills.length / requiredSkills.length) * weight;
  
    return { weightedScore: score, matchedSkills, missingSkills };
  };
  
  // 3. Calculate Certification Match
  const calculateCertificationsMatch = (resumeCertifications, preferredCertifications) => {
    const weight = 30; // 30% weight for certifications
    let score = 0;
  
    if (!resumeCertifications || resumeCertifications.length === 0) {
      return { weightedScore: score, matchedCertifications: [], missingCertifications: preferredCertifications || [] };
    }
  
    const matchedCertifications = resumeCertifications.filter((cert) =>
      preferredCertifications.includes(cert.name)
    );
    const missingCertifications = preferredCertifications.filter((cert) =>
      !resumeCertifications.some((resumeCert) => resumeCert.name === cert)
    );
  
    score = (matchedCertifications.length / preferredCertifications.length) * weight;
  
    return { weightedScore: score, matchedCertifications, missingCertifications };
  };
  
  // 4. Calculate Education Match
  const calculateEducationMatch = (resumeEducation, requiredEducation) => {
    const weight = 20; // Assigned 20% weight for education match
    let score = 0;
    let missingEducation = [];
  
    if (!resumeEducation || resumeEducation.length === 0) {
      return { weightedScore: score, missingEducation: requiredEducation };
    }
  
    // Normalize degree terms to simplify comparison (e.g., Bachelor of Technology to Bachelor's Degree)
    const normalizeDegree = (degree) => {
        // Normalize degree by removing extra spaces and converting it to lowercase
        return degree.trim().toLowerCase();
      };
  
    // Normalize degrees in both resume and job description
    const normalizedResumeDegrees = resumeEducation.map(edu => normalizeDegree(edu.degree));
    const normalizedRequiredEducation = requiredEducation.map(edu => normalizeDegree(edu));
  
    // Match normalized degrees
    const matchedEducation = normalizedResumeDegrees.filter(degree =>
      normalizedRequiredEducation.some(requiredDegree => degree.includes(requiredDegree))
    );
  
    if (matchedEducation.length > 0) {
      score = weight; // If there is a match, the full weight is applied
    } else {
      missingEducation = requiredEducation; // If no match, all required education is considered missing
    }
  
    return { weightedScore: score, missingEducation };
  };
  
  