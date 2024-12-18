// Import necessary modules
var express = require("express");
var app = express();
const { body, validationResult } = require("express-validator"); // For validation

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

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

// GET /students/edit/:sid - Render the Edit Student Page
app.get("/students/edit/:sid", (req, res) => {
  const sid = req.params.sid;
  mysqlDAO
    .findById(sid) // Use the DAO function to fetch student by ID
    .then((student) => {
      if (student.length === 0) {
        return res.status(404).send("Student not found");
      }
      res.render("editStudent", { student: student[0], errors: [] });
    })
    // Catch any errors and log them
    .catch((error) => {
      console.error("Error fetching student:", error.message);
      res.status(500).send("Internal Server Error");
    });
});

// POST /students/edit/:sid - Update Student in Database
app.post(
  "/students/edit/:sid",
  [
    body("name")
      .isLength({ min: 2 })
      .withMessage("Student Name should be at least 2 characters"),
    body("age")
      .isInt({ min: 18 })
      .withMessage("Student Age should be at least 18"),
  ],
  (req, res) => {
    const sid = req.params.sid;
    const { name, age } = req.body;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("editStudent", {
        student: { sid, name, age },
        errors: errors.array(),
      });
    }

    // Update the student in the database
    mysqlDAO
      .updateStudent(sid, name, age)
      .then(() => {
        res.redirect("/students"); // Redirect to Students Page on success
      })
      .catch((error) => {
        console.error("Error updating student:", error.message);
        res.status(500).send("Internal Server Error");
      });
  }
);

// GET /students/add - Render the Add Student Page
app.get("/students/add", (req, res) => {
  res.render("addStudent", { student: {}, errors: [] });
});

// POST /students/add - Add a New Student to the Database
app.post(
  "/students/add",
  [
    // Validation rules
    body("sid")
      .isLength({ min: 4, max: 4 })
      .withMessage("Student ID must be 4 characters long"),
    body("name")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("age").isInt({ min: 18 }).withMessage("Age must be 18 or older"),
  ],
  (req, res) => {
    const { sid, name, age } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("addStudent", {
        student: { sid, name, age },
        errors: errors.array(),
      });
    }

    // Add the new student to the database
    mysqlDAO
      .findById(sid) // Check if the Student ID already exists
      .then((existingStudent) => {
        if (existingStudent.length > 0) {
          return res.render("addStudent", {
            student: { sid, name, age },
            errors: [{ msg: "Student with this ID already exists" }],
          });
        }

        // Insert the new student
        return mysqlDAO
          .addStudent(sid, name, age)
          .then(() => res.redirect("/students")) // Redirect to Students Page on success
          .catch((error) => {
            console.error("Error adding student:", error.message);
            res.status(500).send("Internal Server Error");
          });
      })
      .catch((error) => {
        console.error("Error checking student ID:", error.message);
        res.status(500).send("Internal Server Error");
      });
  }
);

// GET /grades - Render the Grades Page
app.get("/grades", (req, res) => {
  mysqlDAO
    .findAllGrades()
    .then((grades) => {
      // Group data by student name
      const groupedGrades = grades.reduce((acc, item) => {
        if (!acc[item.studentName]) {
          acc[item.studentName] = [];
        }
        if (item.moduleName) {
          acc[item.studentName].push({
            moduleName: item.moduleName,
            grade: item.studentGrade,
          });
        }
        return acc;
      }, {});

      // Sort students and their grades
      const sortedGroupedGrades = Object.keys(groupedGrades)
        .sort()
        .reduce((acc, studentName) => {
          acc[studentName] = groupedGrades[studentName].sort(
            (a, b) => a.grade - b.grade
          );
          return acc;
        }, {});

      res.render("grades", { groupedGrades: sortedGroupedGrades });
    })
    .catch((error) => {
      console.error("Error fetching grades:", error.message);
      res.status(500).send("Internal Server Error");
    });
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
