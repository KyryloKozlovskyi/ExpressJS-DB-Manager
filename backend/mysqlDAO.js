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

// Fetch students, their modules, and grades
var findAllGrades = function () {
  const sql = `
    SELECT 
      student.name AS studentName,
      module.name AS moduleName,
      grade.grade AS studentGrade
    FROM student
    LEFT JOIN grade ON student.sid = grade.sid
    LEFT JOIN module ON grade.mid = module.mid
    ORDER BY student.name ASC, grade.grade ASC;
  `;
  return query(sql);
};

// Export the functions
module.exports = {
  findAll,
  findById,
  updateStudent,
  addStudent,
  findAllGrades,
};
