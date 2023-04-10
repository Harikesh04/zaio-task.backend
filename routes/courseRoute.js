import express from "express";
import {  getCourseByDate, uploadCourseData } from "../controllers/couseController.js";

const router = express.Router();


router.get("/days/course",getCourseByDate);
router.post("/course",uploadCourseData);


export default router