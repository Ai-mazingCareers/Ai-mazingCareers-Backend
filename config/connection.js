const DB_USER='shanchezame';
const DB_PASSWORD='Z74N0L9ku2GkRbEu';

const { MongoClient, ServerApiVersion } = require('mongodb');
// require('dotenv').config({ path: '../.env' });



// Connection URI
const uri = `mongodb+srv://${DB_USER}:${DB_PASSWORD}@ai-mazingcareers.kns0c.mongodb.net/?retryWrites=true&w=majority&appName=ai-mazingcareers`;
// console.log("user", DB_USER, process.env.DB_PASSWORD);
// Create a new MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Function to connect to the database
 function connectToDatabase() {
  try {
    // Connect the client to the server
   client.connect();
    
    // Confirm connection
    console.log("Connected successfully to MongoDB Atlas");

  } catch (err) {
    console.error('Failed to connect to MongoDB Atlas', err);
  } finally {
    // Ensure the client will close when you finish/error
     client.close();
  }
}

// Call the connect function
// connectToDatabase();
module.exports = {client, connectToDatabase};