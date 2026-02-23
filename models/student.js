const mongoose = require("mongoose");
const studentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  phone: {
    type: String,
    required: true
  },

  address: {
    type: String,
    required: true
  },

  parentMobile: {
    type: String,
    required: true
  },

  roomNo: {
    type: Number,
    required: true
  },

  course: {
    type: String,
    required: true
  },

  fine: {
    type: Number,
    default: 0
  },

  feeStatus: {
    type: String,
    enum: ["Pending", "Paid"],   // Only these two allowed
    default: "Pending"
  },

  date: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
  },
    branch: {
    type: String,
    required: true
  }

});

module.exports = mongoose.model("Student", studentSchema);