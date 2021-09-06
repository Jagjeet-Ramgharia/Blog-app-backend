const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    about: {
      type: String,
    },
    password: {
      type: String,
      min: 6,
    },
    profilePic: {
      type: String,
      default: "",
    },
    resetToken: String,
    expireToken: Date,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", UserSchema);
