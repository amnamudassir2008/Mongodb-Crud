const mongoose = require("mongoose");


// mongoose.Schema - Database ka structure define krta he.
const studentSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  age: {
    type: Number,
    required: true
  },

  course: {
    type: String,
    required: true
  },

});

// mongoose.model - "Student" model create krta he.
const Student = mongoose.model("Student", studentSchema);

module.exports = Student;