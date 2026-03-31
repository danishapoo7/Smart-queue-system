const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema(
  {
    studentId: String,
    studentName: String,
    feeType: String,
    status: { type: String, default: "waiting" }
  },
  { timestamps: true } // 🔥 important
);

module.exports = mongoose.model("Token", tokenSchema);