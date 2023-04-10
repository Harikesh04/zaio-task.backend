import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    maxlength: [30, "Name cannot exceed 30 character"],
    minlength: [4, "Name should have more than 4 character"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email"],
    unique: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minlength: [8, "Password should be greater than 8 character"],
    select: false,
  },
  createdAt:{
    type:Date,
    default: Date.now
  },
  
  
});

userSchema.pre("save", async function (next) {

  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});



userSchema.methods.getJWTToken = function () {

  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {

    expiresIn: process.env.JWT_EXPIRE,
    
  });
};


userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);

  
};



const User = mongoose.model("User", userSchema);
export default User;
