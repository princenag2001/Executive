import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";
export const register = async (req, res) => {
    try {
        const { fullName, email, password, phone } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "Please provide all fields" });
        }
        // check if user already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Generate hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ fullName, email, password: hashedPassword, phone });
        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    }
    catch (error) {
        console.log(error);
    }
}


export const userProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.user._id).select("-password");
        res.status(200).json(user);
    }
    catch (error) {
        console.log(error);
    }
}


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide all fields" });
        }
        // check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User does not exist" });
        }

        // check if password is correct
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Fetch user data
        const userData = await User.findById(user._id).select("-password");
        // Generate token
        generateToken(user, res);
        res.status(200).json({ message: "Login successful", userData });
    }
    catch (error) {
        console.log(error);
    }
}

export const updateProfile = async (req, res) => {
    const { profilePic } = req.body;

    if (!profilePic) {
        return res.status(400).json({ message: "No image provided" });
    }

    try {
        const result = await cloudinary.uploader.upload(profilePic, {
            upload_preset: "profile-pic",
        });

        const user = await User.findById(req.user.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        user.profilePic = result.secure_url;
        await user.save();

        //Now fetch user
        const updatedUser = await User.findById(req.user.user._id).select("-password");
        res.status(200).json({ message: "Profile picture updated successfully", updatedUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error uploading profile picture" });
    }
};
 