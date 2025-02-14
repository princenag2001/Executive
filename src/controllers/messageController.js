import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io } from "../lib/socket.js";
import mongoose from "mongoose";
import Group from "../models/group.model.js";

export const fetchSideBarUsers = async (req, res) => {
    try {
        const userId = req.user.user._id;
        const users = await User.find({
            // _id: { $ne: userId }
        }).select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.log(error);
    }
}

export const fetchGroups = async (req, res) => {
    try {
        const groups = await Group.find();
        res.status(200).json(groups);
    } catch (error) {
        console.log(error);
    }
}


// remove all messages
const removeAllMessages = async (req, res) => {
    try {
        await Message.deleteMany();
    } catch (error) {
        console.log(error);
    }
}

// removeAllMessages();


// remove all groups
const removeAllGroups = async (req, res) => {
    try {
        await Group.deleteMany();
    } catch (error) {
        console.log(error);
    }
}

// removeAllGroups();


export const getMessages = async (req, res) => {
    try {
        let { id, members, type } = req.params;
        console.log("Received ID:", id, "Members:", members, "Type:", type);

        let memberIds = members ? members.split(",").filter(m => mongoose.Types.ObjectId.isValid(m)) : [];

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid ID format" });
        }

        console.log("Processed Member IDs:", memberIds);

        let queryConditions = [];

        if (type === "group") {
            // Group Chat - Fetch messages using groupId
            queryConditions.push({ groupId: id });
        } else {
            // One-on-One Chat - Ensure correct array handling
            queryConditions.push(
                { sender: id, reciever: req.user.user._id, groupId: null },  // Sent by `id` to logged-in user
                { sender: req.user.user._id, reciever: id, groupId: null },  // Sent by user to `id`
                { sender: id, reciever: { $in: [req.user.user._id] }, groupId: null },  // In case receiver is an array
                { sender: req.user.user._id, reciever: { $in: [id] }, groupId: null }   // Reverse match for array receiver
            );
        }

        console.log("Query Conditions:", JSON.stringify(queryConditions, null, 2));

        const messages = await Message.find({ $or: queryConditions }).sort({ createdAt: 1 });

        console.log("Fetched Messages Count:", messages.length);

        res.status(200).json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};






export const sendMessages = async (req, res) => {
    try {
        const { id } = req.params; // Receiver ID (if single)
        let { text, image, receiverId, type } = req.body; // Array of recipients or single ID

        if (!receiverId || receiverId.length === 0) {
            return res.status(400).json({ error: "At least one recipient is required." });
        }

        console.log("123456", type)

        // Upload image if present
        if (image) {
            const result = await cloudinary.uploader.upload(image);
            image = result.secure_url;
        }

        // Ensure recipients are in an array
        let recipients = Array.isArray(receiverId) ? receiverId : [id];

        // ✅ Create a single message entry with all recipients
        await Message.create({
            sender: req.user.user._id,
            reciever: recipients, // Store as an array instead of separate entries
            text,
            image,
            groupId: type == "group" ? id : null
        });

        // ✅ Fetch all messages related to the sender and recipients
        const allMessages = await Message.find({
            $or: [
                { sender: req.user.user._id, reciever: { $in: recipients } },
                { sender: { $in: recipients }, reciever: req.user.user._id },
            ],
        }).sort({ createdAt: 1 });

        res.status(200).json(allMessages);
    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


