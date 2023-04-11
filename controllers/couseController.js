import Course from "../models/course.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import { course } from "../data/courses.js";
import { catchAsynError } from "../middleware/catchAsyncError.js";

function getBusinessDays(startDateStr, endDateStr) {
  const [startYear, startMonth, startDay] = startDateStr.split("-");
  const [endYear, endMonth, endDay] = endDateStr.split("-");
  const startDate = new Date(startYear, startMonth - 1, startDay);
  const endDate = new Date(endYear, endMonth - 1, endDay);

  let businessDays = 0;

  let curr = new Date(startDate);

  while (curr <= endDate) {
    const dayOfWeek = curr.getDay();

    // If the current day is not a Saturday (6) or Sunday (0)
    if (dayOfWeek !== 6 && dayOfWeek !== 0) {
      businessDays++;
    }

    curr.setDate(curr.getDate() + 1); // Move to the next day
  }

  return businessDays;
}

function filterData(arr, totalTime) {
  let filteredArr = [];


  for (let obj of arr) {
    if (totalTime - obj.duration >= 0) {
      totalTime -= obj.duration;
      filteredArr.push(obj);
    } else {
      return filteredArr;
    }
  }
  return filteredArr;
}

export const uploadCourseData = catchAsynError(async (req, res, next) => {
  const courses = course;

  await Course.deleteMany({});
  await Course.create(courses);
  res.status(200).json({
    success: true,
    message: "course uploaded .",
  });
});

export const getCourseByDate = catchAsynError(async (req, res, next) => {
  const endDate = req.query.Date;
  const hoursUserWillCommit = req.query.hours;

  const { token } = req.cookies;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  let enrolledDate = user.createdAt;

  const date = new Date(enrolledDate);


  date.setDate(date.getDate() + 1);

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");

  let startDate = `${year}-${month}-${day}`;

  const businessDaysCount = getBusinessDays(startDate, endDate);
  const totalhours = businessDaysCount * hoursUserWillCommit;

  const courses = await Course.find();
  let timeofSingleDay = hoursUserWillCommit * 60;
  let days = businessDaysCount;
  courses.sort();
  let startdate = new Date(startDate);
if (startdate.getDay() == 6) { // Saturday
  startdate.setDate(startdate.getDate() + 2); // add two days to make it Monday
} else if (startdate.getDay() == 0) { // Sunday
  startdate.setDate(startdate.getDate() + 1); 
}

for (let i = 0; i < courses.length; i++) {
  if (timeofSingleDay <= 0) {
    // increment the start date by one day
    startdate.setDate(startdate.getDate() + 1);
    if (startdate.getDay() == 6) { // Saturday
      startdate.setDate(startdate.getDate() + 2); // add two days to make it Monday
    } else if (startdate.getDay() == 0) { // Sunday
      startdate.setDate(startdate.getDate() + 1); // add one day to make it Monday
    }
    
    startdate.setHours(0, 0, 0, 0);

    timeofSingleDay = hoursUserWillCommit * 60;
    days--;

  }

  courses[i].date = new Date(startdate);
  timeofSingleDay -= courses[i].duration;

  if (days <= 0) break;
}








  const filteredCourses = filterData(courses, totalhours * 60);

  res.status(200).json({
    startDate,
    businessDaysCount,
    filteredCourses,
  });
});
