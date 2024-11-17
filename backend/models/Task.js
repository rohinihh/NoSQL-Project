const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  description: {
    type: String,
    required: true,
  },
  dueDate: {
    type: Date,  // Storing dueDate as a Date type
    required: false,  // Make this field optional
    default: null  // If no date is provided, set it to null by default
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt fields
});

const Task = mongoose.model("Task", taskSchema, "Task");
module.exports = Task;
