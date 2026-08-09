import { jest } from "@jest/globals";
import request from "supertest";

process.env.JWT_SECRET = "test-secret-not-used-in-prod";

jest.unstable_mockModule("../../src/config/prisma.js", () => ({
    default: { event: {} }
}));

const { default: app } = await import("../../src/app.js");

describe("documentation OpenAPI", () => {

    test("GET /api/events/docs.json renvoie un contrat OpenAPI valide", async () => {
        const res = await request(app).get("/api/events/docs.json");

        expect(res.status).toBe(200);
        expect(res.body.openapi).toBe("3.0.3");
        expect(Object.keys(res.body.paths["/"])).toEqual(
            expect.arrayContaining(["get", "post"])
        );
    });

    test("GET /api/events/docs sert l'interface Swagger UI", async () => {
        const res = await request(app).get("/api/events/docs/");

        expect(res.status).toBe(200);
        expect(res.type).toBe("text/html");
    });

});
