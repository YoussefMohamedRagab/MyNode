import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    organizations: [{
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Organization', // Reference to the Organization model
            required: true,
        },
        accessLevel: {
            type: String,
            enum: ['admin', 'member'], // Define access levels within the organization
            required: true,
        }
    }]

});

// Create and export the User model
const User = mongoose.model('User', UserSchema);
export default User;