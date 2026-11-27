// const express = require("express");

// const router = express.Router();

// const {
//   createStudent,
//   getStudents,
//   getStudentById,
//   updateStudent,
//   deleteStudent
// } = require("../controllers/studentController");

// // CREATE
// router.post("/", createStudent);

// // READ ALL
// router.get("/", getStudents);

// // READ SINGLE
// router.get("/:id", getStudentById);

// // UPDATE
// router.put("/:id", updateStudent);

// // DELETE
// router.delete("/:id", deleteStudent);

// module.exports = router;

const express = require("express");
const router = express.Router();

const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent
} = require("../controllers/studentController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createStudent);
router.get("/", authMiddleware, getStudents);
router.get("/:id", authMiddleware, getStudentById);
router.put("/:id", authMiddleware, updateStudent);
router.delete("/:id", authMiddleware, deleteStudent);

module.exports = router;