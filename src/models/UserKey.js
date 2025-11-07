const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
  {
    request_id: { type: String, required: true },
    public_key: { type: String, required: true, unique: true },
    private_key: { type: String, required: true, unique: true },
  },
  {
    timestamps: { createdAt: 'created_at' },
    versionKey: false
  }
);

module.exports = mongoose.model("user_key", authSchema);
