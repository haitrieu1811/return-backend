import express from "express";
import bodyParser from "body-parser";
// import cors from "cors";
require("dotenv").config();

import viewEngine from "./config/viewEngine";
import initWebRoutes from "./routes/web";
import connectDB from "./config/connectDB";

import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
// app.use(cors());

// Add headers before the routes are defined
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader("Access-Control-Allow-Origin", process.env.URL_REACT);

    // Request methods you wish to allow
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
    );

    // Request headers you wish to allow
    res.setHeader(
        "Access-Control-Allow-Headers",
        "X-Requested-With,content-type"
    );

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader("Access-Control-Allow-Credentials", true);

    // Pass to next layer of middleware
    next();
});

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

viewEngine(app);
initWebRoutes(app);

connectDB();

let port = process.env.PORT || 6969;

server.listen(port, () => {
    console.log(`Backend is runing in PORT: ${port}`);
});

// Socket io
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    // console.log(`User connected with id: ${socket.id}`);

    socket.on("JOIN_ROOM_CHAT", (roomChatId) => {
        socket.leaveAll();
        socket.join(`CHAT_ROOM_${roomChatId}`);
        console.log(`User with id: ${socket.id} join room ${roomChatId}`);
    });

    socket.on("SEND_MESSAGE", (messageData) => {
        // console.log(
        //     `>>> Send message to room: [${messageData.chatRoomId}] with message data: `,
        //     messageData
        // );

        socket
            .to(`CHAT_ROOM_${messageData.chatRoomId}`)
            .emit("RECEIVE_MESSAGE", messageData);

        // socket.broadcast.emit("RECEIVE_MESSAGE", messageData);
    });

    socket.on("disconnect", () => {
        // console.log("User disconnected", socket.id);
    });
});
