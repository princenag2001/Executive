import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
export const protectedRoute = async (req, res, next) => {
    if (!req.cookies.token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    // Check if token is valid
    const token = req.cookies.token;
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = user;
    });

    console.log(req.user);
    //CHeck if user exists
    const user = await User.findById(req.user.user._id).select("-password");
    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    next();
}