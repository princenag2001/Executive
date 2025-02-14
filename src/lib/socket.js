import { Server } from "socket.io";
import http from "http";
import express from "express";
import Group from "../models/group.model.js";
import { profile } from "console";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    },
});

// Object to store online users
const onlineUsers = {};

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);
    const userId = socket.handshake.query.userId;

    if (userId) {
        onlineUsers[userId] = socket.id;
    }

    console.log("Online users:", onlineUsers);
    io.emit("onlineUsers", Object.keys(onlineUsers));

    // 🔹 Listen for new messages
    socket.on("sendMessage", (message) => {
        console.log("📩 Received Message:", message, Array.isArray(message.receiverId) ? message.receiverId.length : 1);

        // Ensure receiverId is always treated as an array
        const receiverIds = Array.isArray(message.receiverId) ? message.receiverId : [message.receiverId];
        // Get current UTC time
        const timestamp = new Date().toISOString();

        receiverIds.forEach(receiverId => {
            let obj = {
                sender: message.senderId,
                receiver: receiverId,
                text: message?.text,
                image: message?.image,
                type: message?.type,
                groupId: message?.groupId,
                timestamp
            };

            // Retrieve socket ID of the receiver
            const receiverSocketId = onlineUsers[receiverId];
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("newMessage", obj); // Send message to each receiver in the group
            }
        });

        // Ensure the sender also gets the message
        const senderSocketId = onlineUsers[message.senderId];
        if (senderSocketId) {
            io.to(senderSocketId).emit("newMessage", {
                sender: message.senderId,
                receiver: receiverIds, // Ensure sender gets the full recipient list
                text: message?.text,
                image: message?.image,
                type: message?.type,
                groupId: message?.groupId,
                timestamp
            });
        }
    });




    socket.on("inputChange", (data) => {
        let obj = {
            sender: data.senderId,
            status: data.status
        };

        const receiverSocketId = onlineUsers[data.receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("typing", obj); // Send to receiver
        }
    })


    socket.on("createGroup", async (data) => {
        try {
            let obj = {
                members: data?.members || [],
                name: data?.groupName || "Untitled",
                groupPic: data?.profilePic || "",
                type: "group"
            };

            console.log("Creating Group:", obj);

            const newGroup = new Group(obj);
            const group = await newGroup.save(); // ✅ Await DB save

            // ✅ Notify all group members
            for (let i = 0; i < data.members.length; i++) {
                const memberSocketId = onlineUsers[data.members[i]];
                if (memberSocketId) {
                    io.to(memberSocketId).emit("groupCreated", group);
                }
            }


        } catch (error) {
            console.error("Error creating group:", error);
            socket.emit("groupCreationError", { message: "Failed to create group" });
        }
    });


    // 🔹 Handle user disconnect
    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        Object.keys(onlineUsers).forEach((key) => {
            if (onlineUsers[key] === socket.id) {
                delete onlineUsers[key];
            }
        });

        io.emit("onlineUsers", Object.keys(onlineUsers));
    });
});

export { app, server, io };
