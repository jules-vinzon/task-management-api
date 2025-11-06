const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { taskValidator } = require("../validators/validators");
const taskController = require("../controllers/taskController");

router.use(auth);

router.post("/", taskValidator, taskController.createTask);
router.get("/", taskController.getTasks);
router.get("/:id", taskController.getTask);
router.put("/:id", taskValidator, taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

module.exports = router;
