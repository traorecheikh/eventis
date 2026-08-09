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

    test("le schema AuthResponse est complet (utilise par register et le client genere)", () => {
        return request(app).get("/api/auth/docs.json").then((res) => {
            const authResponse = res.body.components.schemas.AuthResponse;

            expect(authResponse).toBeDefined();
            expect(authResponse.required).toEqual(
                expect.arrayContaining(["user", "token", "expiresIn"])
            );
        });
    });

    test("la reponse 200 de /login declare user et token comme requis", async () => {
        const res = await request(app).get("/api/auth/docs.json");
        const loginResponseSchema = res.body.paths["/login"].post.responses["200"].content["application/json"].schema;

        expect(loginResponseSchema.required).toEqual(
            expect.arrayContaining(["user", "token"])
        );
    });

    test("/me exige l'authentification bearer", async () => {
        const res = await request(app).get("/api/auth/docs.json");
        const meOperation = res.body.paths["/me"].get;

        expect(meOperation.security).toEqual([{ bearerAuth: [] }]);
    });

    test("GET /api/auth/docs sert l'interface Swagger UI", async () => {
        const res = await request(app).get("/api/auth/docs/");

        expect(res.status).toBe(200);
        expect(res.type).toBe("text/html");
    });

});
