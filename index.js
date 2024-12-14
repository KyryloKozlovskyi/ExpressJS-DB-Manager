// Import express
var express = require("express");
var app = express();

// Set view engine
let ejs = require("ejs");
app.set("view engine", "ejs");

// Port listener
app.listen(3004, () => {
  console.log("Application listening on port 3004");
});

// Home
app.get("/", (req, res) => {
  console.log("GET");
  res.render("index");
});
