import express from "express";
const app = express();
import bodyParser from "body-parser";
import dotenv from "dotenv";
import connectDatabase from "./database.js";
import cors from "cors";

import Course from "./models/course.js";
import courseRoute from "./routes/courseRoute.js";
import userRoute from "./routes/userRoute.js";


import cookieParser from "cookie-parser";

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://127.0.0.1:5174'],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);


if (process.env.NODE_ENV !== "PRODUCTION") {
  dotenv.config({ path: "config/config.env" });
}

process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to uncaught Exception error`);

  process.exit(1); //server getting off
});

connectDatabase();

const server = app.listen(process.env.PORT, () => {
  console.log(`Server is working at http://localhost:${process.env.PORT}`);
  
});

app.use("/api/v1", courseRoute);
app.use("/api/v1", userRoute);

app.get("/", (req, res) => {
  res.send("Nice working");
});











process.on("unhandledRejection", (err) => {
  //unhandledRejection is the name of the event
  console.log(`Error: ${err.message}`);
  console.log(`Shutting down the server due to unhandled promise rejection`);

  server.close(() => {
   

    process.exit(1);
  });
});

//
