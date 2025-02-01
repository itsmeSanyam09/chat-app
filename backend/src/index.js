import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import bodyParser from "body-parser";




import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import { io,app, server } from "./lib/socket.js";



dotenv.config();


const PORT = process.env.PORT;
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json({ limit: '50mb' })); 
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


app.use(express.json());
app.use(cookieParser());



app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);



server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});