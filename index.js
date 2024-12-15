// Import express
var express = require("express");
var app = express();

// Set view engine
let ejs = require("ejs");
app.set("view engine", "ejs");

// Home Page Route
app.get("/", (req, res) => {
  res.render("home"); // Render the Home Page
});

// Students Page Route
app.get("/students", (req, res) => {
  res.render("students"); // Render the Students Page
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
