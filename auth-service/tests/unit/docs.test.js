import { jest } from "@jest/globals";
import request from "supertest";

process.env.JWT_SECRET = "test-secret-not-used-in-prod";

jest.unstable_mockModule("../../src/config/prisma.js", () => ({
    default: { user: {} }
}));

const { default: app } = await import("../../src/app.js");

describe("documentation OpenAPI", () => {

    test("GET /api/auth/docs.json renvoie un contrat OpenAPI valide", async () => {
        const res = await request(app).get("/api/auth/docs.json");

        expect(res.status).toBe(200);
        expect(res.body.openapi).toBe("3.0.3");
        expect(Object.keys(res.body.paths)).toEqual(
            expect.arrayContaining(["/register", "/login", "/me"])
        );
    });

    test("GET /api/auth/docs sert l'interface Swagger UI", async () => {
        const res = await request(app).get("/api/auth/docs/");

        expect(res.status).toBe(200);
        expect(res.type).toBe("text/html");
    });

});
