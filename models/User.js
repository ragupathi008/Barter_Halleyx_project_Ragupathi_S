const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["admin", "user"], default: "user" },
   profileImage: {
    type: String,
    default: "" // or you can add a default image URL if needed
  }
});

module.exports = mongoose.model("User", userSchema);
