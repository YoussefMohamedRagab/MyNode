import jwt from "jsonwebtoken";
import dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

const generateAccessToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET,{ expiresIn: '15m'});
    return token;
};

const generateRefreshToken = (userId) => {
    const token = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '7d'});
    return token;
};

const verifyRefreshToken = async (token) => {
    try {
        const isVerified =  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
        return isVerified;   
    } catch (error) {
        throw new Error("Invalid token");
    }
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); // Verify the token
    } catch (error) {
        throw new Error("Invalid token");
    }
};

export { generateAccessToken, generateRefreshToken, verifyRefreshToken, verifyToken };
