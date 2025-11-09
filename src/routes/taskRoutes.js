const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { taskValidator } = require("../validators/validators");
const taskController = require("../controllers/taskController");

// router.use(auth);

router.post("/", authMiddleware, taskValidator, taskController.createTask);
router.get("/", taskController.getTasks);
router.get("/:id", authMiddleware, taskController.getTask);
router.put("/:id", authMiddleware, taskController.updateTask);
router.post("/delete", authMiddleware, taskController.deleteTasks);

module.exports = router;
