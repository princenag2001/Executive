import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import connectDB from "./lib/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import {app, server, io} from "./lib/socket.js";


dotenv.config();


const PORT = process.env.PORT || 3001;


app.use(cookieParser());

const corsOptions = {
    origin: "http://localhost:3000",
    credentials: true
}

app.use(cors(corsOptions));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

server.listen(PORT, () => {
    console.log("Server running on port " + PORT);
    connectDB();
});