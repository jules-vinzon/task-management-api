const { validationResult } = require("express-validator");
const Task = require("../models/Task");
const mongoose = require("mongoose");


exports.createTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { owner_id, ...rest } = req.body;

    const task = new Task({
      ...rest,
      owner: new mongoose.Types.ObjectId(owner_id),
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
    next(err);
  }
};

exports.getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
    next(err);
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.find({ owner: req.params.id });
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
    next(err);
  }
};

exports.updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });
  console.log("Update Task Request Body:", req.body);
  console.log("Update Task ID:", req.params.id);

  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.body.owner_id },
      { $set: req.body },
      { new: true }
    );
    if (!task)
      return res
        .status(404)
        .json({ error: "Task not found or not authorized" });
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteTasks = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "No task IDs provided" });
    }

    const result = await Task.deleteMany({ _id: { $in: ids } });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "No tasks found or not authorized" });
    }

    res.json({ msg: `${result.deletedCount} task(s) deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


