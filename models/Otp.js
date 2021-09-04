const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    code: String,
    expireIn: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("otp", otpSchema, "otp");
