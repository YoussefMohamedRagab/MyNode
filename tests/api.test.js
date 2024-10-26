import request from "supertest";
import app from "../index.js"; // Adjust the import based on your server file

describe("API Endpoints", () => {
    let accessToken;
    let refreshToken;

    it("should sign up a new user", async () => {
        const response = await request(app)
            .post("/signup")
            .send({ name: "New User", email: "newuser@example.com", password: "password" });
        
        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("message", "User registered successfully");
    });

    it("should prevent duplicate user registration", async () => {
        const response = await request(app)
            .post("/signup")
            .send({ name: "New User", email: "newuser@example.com", password: "password" });
        
        expect(response.statusCode).toBe(400);
        expect(response.body).toHaveProperty("message", "User already exists");
    });

    it("should sign in a user", async () => {
        const response = await request(app)
            .post("/signin")
            .send({ email: "newuser@example.com", password: "password" });
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("access_token");
        expect(response.body).toHaveProperty("refresh_token");

        accessToken = response.body.access_token;
        refreshToken = response.body.refresh_token;
    });

    it("should refresh the access token", async () => {
        const response = await request(app)
            .post("/refresh-token")
            .send({ refresh_token: refreshToken });

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message", "Token refreshed successfully");
        expect(response.body).toHaveProperty("access_token");
        expect(response.body).toHaveProperty("refresh_token", refreshToken);
    });

    it("should return an error for an invalid refresh token", async () => {
        const response = await request(app)
            .post("/refresh-token")
            .send({ refresh_token: "invalid_refresh_token" });

        expect(response.statusCode).toBe(403);
        expect(response.body).toHaveProperty("message", "Invalid refresh token");
    });

    it("should retrieve all organizations", async () => {
        const response = await request(app)
            .get("/organization")
            .set("Authorization", `Bearer ${accessToken}`);
        
        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });

    it("should create a new organization", async () => {
        const response = await request(app)
            .post("/organization")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Test Organization", description: "A test organization" });

        expect(response.statusCode).toBe(201);
        expect(response.body).toHaveProperty("organization_id");
        expect(response.body).toHaveProperty("name", "Test Organization");
        expect(response.body).toHaveProperty("description", "A test organization");
    });

    it("should update an organization", async () => {
        const orgId = "your_organization_id_here"; // Replace with actual organization ID for testing
        const response = await request(app)
            .put(`/organization/${orgId}`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ name: "Updated Organization", description: "Updated description" });
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("organization_id", orgId);
        expect(response.body).toHaveProperty("name", "Updated Organization");
        expect(response.body).toHaveProperty("description", "Updated description");
    });

    it("should delete an organization", async () => {
        const orgId = "your_organization_id_here"; // Replace with actual organization ID for testing
        const response = await request(app)
            .delete(`/organization/${orgId}`)
            .set("Authorization", `Bearer ${accessToken}`);
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message", "Organization deleted successfully");
    });

    it("should invite a user to an organization", async () => {
        const orgId = "your_organization_id_here"; // Replace with actual organization ID for testing
        const response = await request(app)
            .post(`/organization/${orgId}/invite`)
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ user_email: "anotheruser@example.com" });
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message", "User invited to organization successfully");
    });

    it("should revoke the refresh token", async () => {
        const response = await request(app)
            .post("/revoke-refresh-token")
            .set("Authorization", `Bearer ${accessToken}`)
            .send({ refresh_token: refreshToken });
        
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty("message", "Refresh token revoked successfully");
    });
});
