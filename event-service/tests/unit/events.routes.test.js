import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test-secret-not-used-in-prod";

const mockEvent = {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn()
};

jest.unstable_mockModule("../../src/config/prisma.js", () => ({
    default: { event: mockEvent }
}));

const { default: app } = await import("../../src/app.js");

function token(payload = { id: 1, email: "a@a.sn", role: "organisateur" }) {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
}

beforeEach(() => {
    mockEvent.findMany.mockReset();
    mockEvent.count.mockReset();
    mockEvent.create.mockReset();
});

const VALID_EVENT = {
    title: "Conference IA et Afrique",
    description: "Panel",
    date: "2099-01-01T00:00:00.000Z",
    location: "Dakar",
    maxCapacity: 100
};


describe("GET /api/events", () => {

    test("accessible sans jeton (accès public exigé par le contrat)", async () => {
        mockEvent.findMany.mockResolvedValue([]);
        mockEvent.count.mockResolvedValue(0);

        const res = await request(app).get("/api/events");

        expect(res.status).toBe(200);
    });

    test("renvoie data + pagination au format du contrat", async () => {
        mockEvent.findMany.mockResolvedValue([{ id: 1 }]);
        mockEvent.count.mockResolvedValue(1);

        const res = await request(app).get("/api/events");

        expect(res.body).toEqual({
            data: [{ id: 1 }],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1 }
        });
    });

    test("limit plafonne a 100 meme si le client demande plus", async () => {
        mockEvent.findMany.mockResolvedValue([]);
        mockEvent.count.mockResolvedValue(0);

        await request(app).get("/api/events?limit=9999");

        expect(mockEvent.findMany).toHaveBeenCalledWith(
            expect.objectContaining({ take: 100 })
        );
    });

});


describe("POST /api/events", () => {

    test("rejette sans jeton", async () => {
        const res = await request(app).post("/api/events").send(VALID_EVENT);

        expect(res.status).toBe(401);
        expect(mockEvent.create).not.toHaveBeenCalled();
    });

    test("rejette un jeton invalide ou trafique", async () => {
        const res = await request(app)
            .post("/api/events")
            .set("Authorization", "Bearer ceci-nest-pas-un-jwt-valide")
            .send(VALID_EVENT);

        expect(res.status).toBe(401);
        expect(mockEvent.create).not.toHaveBeenCalled();
    });

    test("rejette un corps de requete absent", async () => {
        const res = await request(app)
            .post("/api/events")
            .set("Authorization", `Bearer ${token()}`)
            .set("Content-Type", "text/plain")
            .send();

        expect(res.status).toBe(400);
    });

    test("rejette un titre trop court", async () => {
        const res = await request(app)
            .post("/api/events")
            .set("Authorization", `Bearer ${token()}`)
            .send({ ...VALID_EVENT, title: "IA" });

        expect(res.status).toBe(400);
    });

    test("rejette une location manquante", async () => {
        const res = await request(app)
            .post("/api/events")
            .set("Authorization", `Bearer ${token()}`)
            .send({ ...VALID_EVENT, location: "" });

        expect(res.status).toBe(400);
    });

    test("rejette une date dans le passe", async () => {
        const res = await request(app)
            .post("/api/events")
            .set("Authorization", `Bearer ${token()}`)
            .send({ ...VALID_EVENT, date: "2020-01-01T00:00:00.000Z" });

        expect(res.status).toBe(400);
    });

    test("rejette une date numerique (epoch ms), meme representant le meme instant valide", async () => {
        const res = await request(app)
            .post("/api/events")
            .set("Authorization", `Bearer ${token()}`)
            .send({ ...VALID_EVENT, date: Date.parse(VALID_EVENT.date) });

        expect(res.status).toBe(400);
    });

    test("rejette une date au format non ISO 8601 (ex: format US)", async () => {
        const res = await request(app)
            .post("/api/events")
            .set("Authorization", `Bearer ${token()}`)
            .send({ ...VALID_EVENT, date: "01/01/2099" });

        expect(res.status).toBe(400);
    });

    test("rejette un title non-chaine", async () => {
        const res = await request(app)
            .post("/api/events")
            .set("Authorization", `Bearer ${token()}`)
            .send({ ...VALID_EVENT, title: 12345 });

        expect(res.status).toBe(400);
    });

    test("rejette une maxCapacity non entiere ou negative", async () => {
        const res = await request(app)
            .post("/api/events")
            .set("Authorization", `Bearer ${token()}`)
            .send({ ...VALID_EVENT, maxCapacity: -5 });

        expect(res.status).toBe(400);
    });

    test("accepte un evenement valide et attache le createur depuis le jeton", async () => {
        mockEvent.create.mockResolvedValue({ id: 1, ...VALID_EVENT, creatorId: 42 });

        const res = await request(app)
            .post("/api/events")
            .set("Authorization", `Bearer ${token({ id: 42, email: "a@a.sn", role: "organisateur" })}`)
            .send(VALID_EVENT);

        expect(res.status).toBe(201);
        expect(mockEvent.create).toHaveBeenCalledWith(
            expect.objectContaining({ data: expect.objectContaining({ creatorId: 42 }) })
        );
    });

    test("ne divulgue jamais le message d'erreur brut de la base", async () => {
        mockEvent.create.mockRejectedValue(new Error("connexion base de donnees perdue sur 10.0.0.5"));

        const res = await request(app)
            .post("/api/events")
            .set("Authorization", `Bearer ${token()}`)
            .send(VALID_EVENT);

        expect(res.status).toBe(500);
        expect(res.body.error).not.toMatch(/10\.0\.0\.5/);
    });

});
