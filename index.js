import express from "express";
import mongoose from "mongoose";
import authRoutes from './routes/auth.js';
import organizationRoutes from './routes/organization.js';
import dotenv from 'dotenv';
import authenticate from "./routes/middleware.js";

const app = express();

dotenv.config();

const port = process.env.PORT;
const mongoURI = process.env.MONGO_URI;

app.use(express.json())


// Use routes
app.use('/', authRoutes);
app.use('/organization',authenticate, organizationRoutes);

await mongoose.connect(mongoURI ,{ useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log('Connected to MongoDB'))
.catch((err) => console.error('Failed to connect to MongoDB:', err));

app.listen(port, ()=>{
    console.log(`server is starting at port ${port}`);
});
