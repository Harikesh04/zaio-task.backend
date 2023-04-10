import ErrorHandler from "../utils/errorhandler.js";
import { catchAsynError } from "../middleware/catchAsyncError.js";
import sendToken from "../utils/jwtToken.js";
import jwt from "jsonwebtoken";
import CircularJSON from 'circular-json';

import User from "../models/user.js";

export const registerUser = catchAsynError(async (req, res, next) => {
 
  
    const { name, email, password } = req.body; 
    let userExist = await User.findOne({ email });

    if (userExist) return next(new ErrorHandler("User Already Exist", 400));//we are fetching these data from the user
    const user = await User.create({
      // since we have fetched the data at very first that is why we are passing object here
      name,
      email,
      password,
    });
  
    sendToken(user, 201, res);
  });

  export const loginUser = catchAsynError(async (req, res, next) => {
    const { email, password } = req.body; //taking email and password from the user to login
  
    //checking that wether email and password both  are taken or not
    if (!email || !password) {
      return next(new ErrorHandler("Please enter Email and Password", 400));
    }
  
    const user = await User.findOne({ email }).select("+password");
    // this is done because in user Model we have marked the password select false;
  
    if (!user) {
      return next(new ErrorHandler("Invalid email or password ", 401));
    }
  
    const isPasswordMatched = await user.comparePassword(password);
    // if entered password is wrong
    if (!isPasswordMatched) {
      return next(new ErrorHandler("Invalid email or password ", 401));
    }
  
    // password is correct
    sendToken(user, 200, res);
  });

  
  export const logOut = catchAsynError(async (req, res, next) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()), //taking the token from cookie and expiring it now
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "PRODUCTION" ? "none" : "lax",
      secure: process.env.NODE_ENV === "PRODUCTION" ? true : false,
    }
    
    );
    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  });

  export const getUserDetail = catchAsynError(async (req, res, next) => {

    
        const { token } = req.cookies;

        if (!token)
          return res.status(404).json({
            success: false,
            message: "Login First",
          });
    
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          

       
        const user =  await User.findById(decoded.id);
       
      
        res.status(200).json({
          success: true,
         user,
        });
        
   
   
  });