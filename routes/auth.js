import express from "express";
import bcrypt from "bcryptjs"
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken ,revokeToken } from '../helpers/tokenHelper.js';
import dotenv from "dotenv";
import authenticate from "./middleware.js";


dotenv.config();

const router = express.Router();

router.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            name,
            email,
            password: hashedPassword,
        });

        await user.save();

        // Send response
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate tokens using the token service
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.status(200).json({
            message: "Signin successful",
            access_token: accessToken,
            refresh_token: refreshToken
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

router.post("/refresh-token", async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ message: "Refresh token is required" });
    }

    try {
        // Use the verify function from tokenService
        const user = await verifyRefreshToken(refresh_token);

        if(!user){
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        // Generate a new access token
        const accessToken = generateAccessToken(user.userId);
        res.status(200).json({
            message: "Token refreshed successfully",
            access_token: accessToken,
            refresh_token: refresh_token // Returning the same refresh token
        });
    } catch (err) {
        return res.status(401).json({ message: "Invalid refresh token" });
    }
});


router.post("/revoke-refresh-token",authenticate, async (req, res) => {
    const { refresh_token } = req.body;

    if (!refresh_token) {
        return res.status(400).json({ message: "Refresh token is required" });
    }

    // Revoke the refresh token in Redis
    const result = await revokeToken(refresh_token);
    if(!result){
        res.status(400).json({ message: "Bad request" });
    }

    res.status(200).json({ message: "Refresh token revoked successfully" });
});



export default router;