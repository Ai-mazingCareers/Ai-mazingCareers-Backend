const { connect } = require('mongoose');
const { client, connectToDatabase } = require('../config/connection');  



async function resumeInfo(req, res) {

  const resumeData = req.body;  

  try {
    
    const db = client.db('Seeker'); 
    const collection = db.collection('resume-info');  

    
    const result = await collection.insertOne(resumeData);

    res.status(201).json({ message: 'Resume inserted successfully', insertedId: result.insertedId });
  } catch (err) {
    console.error('Error inserting resume:', err);
    res.status(500).json({ message: 'Error inserting resume', error: err.message });
  }
}

module.exports = { resumeInfo };


// exports.getResume = (req, res) => {
    
// };