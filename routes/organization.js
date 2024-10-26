import express from "express";
import Organization from "../models/Organization.js";
import mongoose from "mongoose";
import User from "../models/User.js";

const router = express.Router();

// Create Organization Endpoint
router.post("/", async (req, res) => {
    const { name, description } = req.body;

    try {
        const organization = new Organization({ name, description });
        // Optionally, you could add the creator as a member of the organization
        organization.members.push({ userId: req.user.userId, accessLevel: 'admin' });
        await organization.save();

        res.status(201).json({ organization_id: organization._id });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server error");
    }
});

// Read Organization Endpoint
router.get("/:organizationId", async (req, res) => {
    const { organizationId } = req.params;

    if (!mongoose.isValidObjectId(organizationId)) {
        return res.status(400).json({ message: "Invalid organization ID format" });
    }

    try {
        const organization = await Organization.findById(organizationId);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }
        res.status(200).json(organization);
    } catch (err) {
        console.error("Error retrieving organization:", err);
        res.status(500).send("Server error");
    }
});

// GET /organization - Read All Organizations
router.get("/", async (req, res) => {
    try {
        const organizations = await Organization.find({})
            .populate("members.userId", "name email") // Populate user info in members
            .lean();

        const response = organizations.map(org => ({
            organization_id: org._id.toString(),
            name: org.name,
            description: org.description,
            organization_members: org.members.map(member => ({
                name: member.userId.name,
                email: member.userId.email,
                access_level: member.accessLevel,
            })),
        }));

        res.status(200).json(response);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// PUT /organization/:organization_id - Update Organization
router.put("/:organization_id", async (req, res) => {
    const { organization_id } = req.params;
    const { name, description } = req.body;

    if (!mongoose.isValidObjectId(organization_id)) {
        return res.status(400).json({ message: "Invalid organization ID format" });
    }

    try {
        const updatedOrg = await Organization.findByIdAndUpdate(
            organization_id,
            { name, description },
            { new: true }
        );

        if (!updatedOrg) {
            return res.status(404).json({ message: "Organization not found" });
        }

        res.status(200).json({
            organization_id: updatedOrg._id.toString(),
            name: updatedOrg.name,
            description: updatedOrg.description,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
});

// DELETE /organization/:organization_id - Delete Organization
router.delete("/:organization_id", async (req, res) => {
    const { organization_id } = req.params;

    if (!mongoose.isValidObjectId(organization_id)) {
        return res.status(400).json({ message: "Invalid organization ID format" });
    }

    try {
        const deletedOrg = await Organization.findByIdAndDelete(organization_id);

        if (!deletedOrg) {
            return res.status(404).json({ message: "Organization not found" });
        }

        res.status(200).json({ message: "Organization deleted successfully" });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/:organization_id/invite", async (req, res) => {
    const { organization_id } = req.params;
    const { email } = req.body;

    // Validate organization ID
    if (!mongoose.isValidObjectId(organization_id)) {
        return res.status(400).json({ message: "Invalid organization ID format" });
    }

    try {
        // Find the organization by ID
        const organization = await Organization.findById(organization_id);
        if (!organization) {
            return res.status(404).json({ message: "Organization not found" });
        }

        // Find the user by email
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the user is already a member
        const isAlreadyMember = organization.members.some(member => member.userId.equals(user._id));
        if (isAlreadyMember) {
            return res.status(400).json({ message: "User is already a member of this organization" });
        }

        // Add the user as a member with "member" access level
        organization.members.push({ userId: user._id, accessLevel: "member" });
        await organization.save();

        res.status(200).json({ message: "User invited to organization successfully" });
    } catch (err) {
        console.error("Server error:", err.message);
        res.status(500).json({ message: "Server error" });
    }
});


export default router;
