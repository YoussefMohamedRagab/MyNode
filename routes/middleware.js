import { verifyToken } from '../helpers/tokenHelper.js'; // Adjust the path to your token service

// Middleware to verify token
const authenticate = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    try {
        const user = verifyToken(token);
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

export default authenticate;

