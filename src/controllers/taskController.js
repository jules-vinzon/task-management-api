const { validationResult } = require("express-validator");
const Task = require("../models/Task");

exports.createTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const task = new Task({ ...req.body, owner: req.user.id });
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
    const task = await Task.findOne({ _id: req.params.id, owner: req.user.id });
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

  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
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

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id,
    });
    if (!task)
      return res
        .status(404)
        .json({ error: "Task not found or not authorized" });
    res.json({ msg: "Task deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
