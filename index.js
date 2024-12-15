// Import express
var express = require("express");
var app = express();

// Import view engine
let ejs = require("ejs");
app.set("view engine", "ejs");

// Import the mysqlDAO
const mysqlDAO = require("./backend/mysqlDAO.js");

// GET / route to render the home page
app.get("/", (req, res) => {
  res.render("home");
});

// GET /students route to render the students page
app.get("/students", (req, res) => {
  mysqlDAO
    .findAll() // Use the DAO function to fetch students
    .then((students) => {
      res.render("students", { students }); // Render the student data with ejs
    })
    // Catch any errors and log them
    .catch((error) => {
      console.error("Error fetching students:", error.message);
      res.status(500).send("Internal Server Error");
    });
});

// Grades Page Route
app.get("/grades", (req, res) => {
  res.render("grades"); // Render the Grades Page
});

// Lecturers Page Route
app.get("/lecturers", (req, res) => {
  res.render("lecturers"); // Render the Lecturers Page
});

// Start the server
const PORT = 3004;
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
