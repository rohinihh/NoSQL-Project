const Task = require("../models/Task");
const { validateObjectId } = require("../utils/validation");

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.status(200).json({ tasks, status: true, msg: "Tasks found successfully.." });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}

exports.getTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    const task = await Task.findOne({ user: req.user.id, _id: req.params.taskId });
    if (!task) {
      return res.status(400).json({ status: false, msg: "No task found.." });
    }
    res.status(200).json({ task, status: true, msg: "Task found successfully.." });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}

exports.postTask = async (req, res) => {
  try {
    const { description, dueDate } = req.body;  // Accept dueDate as part of the request
    if (!description) {
      return res.status(400).json({ status: false, msg: "Description of task not found" });
    }

    // Validate if dueDate is in correct format (e.g., ISO string or timestamp)
    if (dueDate && isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({ status: false, msg: "Invalid date format for dueDate" });
    }

    const task = await Task.create({
      user: req.user.id,
      description,
      dueDate: dueDate ? new Date(dueDate) : null  // Ensure dueDate is stored in correct Date format
    });

    res.status(200).json({ task, status: true, msg: "Task created successfully.." });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}

exports.putTask = async (req, res) => {
  try {
    const { description, dueDate } = req.body;  // Accept dueDate

    if (!description) {
      return res.status(400).json({ status: false, msg: "Description of task not found" });
    }

    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    let task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(400).json({ status: false, msg: "Task with given id not found" });
    }

    if (task.user != req.user.id) {
      return res.status(403).json({ status: false, msg: "You can't update task of another user" });
    }

    // Validate if dueDate is in correct format
    if (dueDate && isNaN(new Date(dueDate).getTime())) {
      return res.status(400).json({ status: false, msg: "Invalid date format for dueDate" });
    }

    // Update description and dueDate if provided
    task = await Task.findByIdAndUpdate(
      req.params.taskId,
      { description, dueDate: dueDate ? new Date(dueDate) : task.dueDate },
      { new: true }
    );

    res.status(200).json({ task, status: true, msg: "Task updated successfully.." });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}

exports.deleteTask = async (req, res) => {
  try {
    if (!validateObjectId(req.params.taskId)) {
      return res.status(400).json({ status: false, msg: "Task id not valid" });
    }

    let task = await Task.findById(req.params.taskId);
    if (!task) {
      return res.status(400).json({ status: false, msg: "Task with given id not found" });
    }

    if (task.user != req.user.id) {
      return res.status(403).json({ status: false, msg: "You can't delete task of another user" });
    }

    await Task.findByIdAndDelete(req.params.taskId);
    res.status(200).json({ status: true, msg: "Task deleted successfully.." });
  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ status: false, msg: "Internal Server Error" });
  }
}
