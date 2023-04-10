import express from "express";
import { registerUser,loginUser,logOut,getUserDetail } from "../controllers/userController.js";


const router = express.Router();

router.post("/register",registerUser);
router.post("/login",loginUser);
router.get("/logout",logOut);
router.get("/me",getUserDetail);



export default router