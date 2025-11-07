const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: { type: String, required: true },
  },
  { timestamps: { createdAt: 'created_at' }, versionKey: false } 
);

module.exports = mongoose.model("user_token", taskSchema);
