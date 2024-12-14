// Import express
var express = require("express");
var app = express();

// Port listener
app.listen(3004, () => {
  console.log("Application listening on port 3004");
});

// Home
app.get("/", (req, res) => {
  console.log("GET");
  res.send("<h1>This is a Home Page!</h1>");
});
