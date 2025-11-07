const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    status: {
      type: String,
      enum: ["Pending", "Ongoing", "Completed"],
      default: "Pending",
    },
    metadata: { type: Object },
  },
  { timestamps: { createdAt: 'created_at' }, versionKey: false } 
);

module.exports = mongoose.model("Task", taskSchema);
