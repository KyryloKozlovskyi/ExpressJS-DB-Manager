// Initialize MongoDB
const MongoClient = require("mongodb").MongoClient;
let db, coll;

// Connect to MongoDB
MongoClient.connect("mongodb://127.0.0.1:27017")
  .then((client) => {
    // Select the database and collection
    db = client.db("proj2024MongoDB");
    coll = db.collection("lecturers");
  })
  .catch((error) => {
    console.log(error.message);
  });

// Function to find all lecturers
var findAllLecturers = function () {
  return new Promise((resolve, reject) => {
    coll
      .find()
      .toArray()
      .then((documents) => {
        resolve(documents);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Function to delete a lecturer by ID
var deleteLecturer = function (id) {
  return new Promise((resolve, reject) => {
    coll
      .deleteOne({ _id: id })
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Function to add a new lecturer
var addLecturer = function (lecturer) {
  return new Promise((resolve, reject) => {
    coll
      .insertOne(lecturer)
      .then(() => {
        resolve();
      })
      .catch((error) => {
        reject(error);
      });
  });
};

// Export the functions
module.exports = { findAllLecturers, deleteLecturer, addLecturer };
