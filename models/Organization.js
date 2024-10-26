import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    members: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model
            required: true,
        },
        accessLevel: {
            type: String,
            enum: ['admin', 'member'], // Define access levels
            required: true,
        }
    }]
});
 

// Create and export the User model
const Organization = mongoose.model('Organization', OrganizationSchema);
export default Organization;