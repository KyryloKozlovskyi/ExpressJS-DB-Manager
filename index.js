// Import necessary modules
var express = require("express");
var app = express();

// Import the express-validator module
const { body, validationResult } = require("express-validator");

// Middleware for parsing form data
app.use(express.urlencoded({ extended: true }));

// Import view engine
let ejs = require("ejs");
app.set("view engine", "ejs");

// Import the mysqlDAO
const mysqlDAO = require("./backend/mysqlDAO.js");

// Import the mongoDAO
const mongoDAO = require("./backend/mongoDAO.js");

// GET / route to render the home page
app.get("/", (req, res) => {
  res.render("home");
});

// GET /students route
app.get("/students", (req, res) => {
  mysqlDAO
    .findAll() // Use the DAO function to fetch all students
    .then((students) => {
      res.render("students", { students }); // Render the student data with ejs
    })
    // Catch any errors and log them
    .catch((error) => {
      console.error("Error fetching students:", error.message);
      res.status(500).send("Internal Server Error");
    });
});

// GET /students/edit/:sid to edit a student
app.get("/students/edit/:sid", (req, res) => {
  const sid = req.params.sid;
  mysqlDAO
    .findById(sid) // Use the DAO function to fetch student by ID
    .then((student) => {
      // If student not found, return 404
      if (student.length === 0) {
        return res.status(404).send("Student not found");
      }
      // Render the Edit Student Page with the student data
      res.render("editStudent", { student: student[0], errors: [] });
    })
    // Catch any errors and log them
    .catch((error) => {
      console.error("Error fetching student:", error.message);
      res.status(500).send("Internal Server Error");
    });
});

// POST /students/edit/:sid to update the student in the database
app.post(
  "/students/edit/:sid",
  // Validation rules for the input fields using express-validator
  [
    body("name")
      .isLength({ min: 2 })
      .withMessage("Student Name should be at least 2 characters"),
    body("age")
      .isInt({ min: 18 })
      .withMessage("Student Age should be at least 18"),
  ],
  // Function to handle the POST request
  (req, res) => {
    const sid = req.params.sid;
    const { name, age } = req.body;
    // Validate input
    const errors = validationResult(req);
    // If there are validation errors, render the Edit Student Page with the errors
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
      // Catch any errors and log them
      .catch((error) => {
        console.error("Error updating student:", error.message);
        res.status(500).send("Internal Server Error");
      });
  }
);

// GET /students/add to render the Add Student Page
app.get("/students/add", (req, res) => {
  res.render("addStudent", { student: {}, errors: [] });
});

// POST /students/add to add a new student to the database
app.post(
  "/students/add",
  [
    // Validation rules for the input fields using express-validator
    body("sid")
      .isLength({ min: 4, max: 4 })
      .withMessage("Student ID must be 4 characters long"),
    body("name")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("age").isInt({ min: 18 }).withMessage("Age must be 18 or older"),
  ],
  // Function to handle the POST request
  (req, res) => {
    const { sid, name, age } = req.body;
    // Check for validation errors
    const errors = validationResult(req);
    // If there are validation errors, render the Add Student Page with the errors
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
          // If the Student ID already exists, return an error message
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
      // Catch any errors and log them
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
        // If the student name does not exist, create an empty array
        if (!acc[item.studentName]) {
          acc[item.studentName] = [];
        }
        // If the module name exists, push the module name and grade to the student
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
        // Sort the student names
        .sort()
        .reduce((acc, studentName) => {
          acc[studentName] = groupedGrades[studentName].sort(
            (a, b) => a.grade - b.grade
          );
          return acc;
        }, {});
      // Render the Grades Page with the grouped and sorted grades
      res.render("grades", { groupedGrades: sortedGroupedGrades });
    })
    // Catch any errors and log them
    .catch((error) => {
      console.error("Error fetching grades:", error.message);
      res.status(500).send("Internal Server Error");
    });
});

// GET /lecturers - Render the Lecturers Page
app.get("/lecturers", (req, res) => {
  mongoDAO
    .findAllLecturers()
    .then((lecturers) => {
      // Sort lecturers by ID
      lecturers.sort((a, b) => {
        if (a._id > b._id) return 1;
        if (a._id < b._id) return -1;
        return 0;
      });
      res.render("lecturers", { lecturers });
    })
    // Catch any errors and log them
    .catch((error) => {
      console.error("Error fetching lecturers:", error.message);
      res.status(500).send("Internal Server Error");
    });
});

// GET /lecturers/delete/:lid - Delete a Lecturer
app.get("/lecturers/delete/:lid", (req, res) => {
  const lid = req.params.lid;
  mysqlDAO
    .lecturerTeachesModules(lid)
    .then((teachesModules) => {
      if (teachesModules) {
        // If the lecturer teaches any modules, return an error message
        return mongoDAO.findAllLecturers().then((lecturers) => {
          res.render("lecturers", {
            lecturers,
            error: lid,
          });
        });
      } else {
        // If the lecturer does not teach any modules, delete the lecturer
        return mongoDAO.deleteLecturer(lid).then(() => {
          res.redirect("/lecturers");
        });
      }
    })
    // Catch any errors and log them
    .catch((error) => {
      console.error("Error deleting lecturer:", error.message);
      res.status(500).send("Internal Server Error");
    });
});

// GET /lecturers/add - Render the Add Lecturer Page
app.get("/lecturers/add", (req, res) => {
  res.render("addLecturer", { lecturer: {}, errors: [] });
});

// POST /lecturers/add - Add a New Lecturer
app.post(
  "/lecturers/add",
  [
    // Validate inputs _id, name, and did using express-validator
    body("_id")
      .isLength({ min: 4, max: 4 })
      .withMessage("Lecturer ID must be exactly 4 characters"),
    body("name")
      .isLength({ min: 2 })
      .withMessage("Name must be at least 2 characters"),
    body("did")
      .isLength({ min: 3, max: 3 })
      .withMessage("Department ID must be exactly 3 characters"),
  ],
  (req, res) => {
    const { _id, name, did } = req.body;

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("addLecturer", {
        lecturer: { _id, name, did },
        errors: errors.array(),
      });
    }

    // Add the new lecturer to the database
    mongoDAO
      .addLecturer({ _id, name, did })
      .then(() => res.redirect("/lecturers")) // Redirect to the lecturers page on success
      .catch((error) => {
        console.error("Error adding lecturer:", error.message);
        res.render("addLecturer", {
          lecturer: { _id, name, did },
          errors: [{ msg: "Error adding lecturer to the database" }],
        });
      });
  }
);

// Start the server
const PORT = 3004;
app.listen(PORT, () =>
  console.log(`Server is running on http://localhost:${PORT}`)
);
