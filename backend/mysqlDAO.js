// Import the mysql module
const mysql = require("mysql");

// Create a connection pool
const pool = mysql.createPool({
  connectionLimit: 1,
  host: "localhost",
  user: "root",
  password: "root",
  database: "proj2024mysql",
});

// Helper function to execute queries. Returns a promise
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      // Handle the error
      if (err) {
        console.log("CATCH=>" + JSON.stringify(err));
        return reject(err);
      }
      // Return the results
      console.log("THEN=>" + JSON.stringify(results));
      resolve(results);
    });
  });
}

// DAO function to get all students in alphabetical order
var findAll = function () {
  const sql = "SELECT * FROM student ORDER BY sid ASC";
  return query(sql);
};

// Fetch a student by ID
var findById = function (sid) {
  const sql = "SELECT * FROM student WHERE sid = ?";
  return query(sql, [sid]);
};

// Update a student by ID
var updateStudent = function (sid, name, age) {
  const sql = "UPDATE student SET name = ?, age = ? WHERE sid = ?";
  return query(sql, [name, age, sid]);
};

// Add a new student
var addStudent = function (sid, name, age) {
  const sql = "INSERT INTO student (sid, name, age) VALUES (?, ?, ?)";
  return query(sql, [sid, name, age]);
};

// Export the functions
module.exports = { findAll, findById, updateStudent, addStudent };
