import jwt from "jsonwebtoken";

export const generateToken = (user, res) => {
    const token =  jwt.sign({user}, process.env.JWT_SECRET, {expiresIn: "1d"});

    res.cookie("token", token, {
        httpOnly: true,
        secure:true,
        sameSite: "None",
        maxAge: 24 * 60 * 60 * 1000
    });
    return token;
}