const MongoClient = require("mongodb").MongoClient;
let db, coll;

MongoClient.connect("mongodb://127.0.0.1:27017")
  .then((client) => {
    db = client.db("proj2024MongoDB");
    coll = db.collection("lecturers");
  })
  .catch((error) => {
    console.log(error.message);
  });

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

module.exports = { findAllLecturers, deleteLecturer };
