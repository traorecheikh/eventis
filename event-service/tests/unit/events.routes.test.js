import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = "test-secret-not-used-in-prod";
process.env.REGISTRATIONS_SERVICE_URL = "http://registrations-service:3003";

const mockEvent = {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn()
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
    mockEvent.findUnique.mockReset();
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


describe("GET /api/events/:id", () => {

    test("accessible sans jeton (accès public exigé par le contrat)", async () => {
        mockEvent.findUnique.mockResolvedValue({ id: 1, ...VALID_EVENT });

        const res = await request(app).get("/api/events/1");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: 1, ...VALID_EVENT });
    });

    test("rejette un id non entier", async () => {
        const res = await request(app).get("/api/events/abc");

        expect(res.status).toBe(400);
        expect(mockEvent.findUnique).not.toHaveBeenCalled();
    });

    test("renvoie 404 si l'evenement n'existe pas", async () => {
        mockEvent.findUnique.mockResolvedValue(null);

        const res = await request(app).get("/api/events/999");

        expect(res.status).toBe(404);
    });

});


describe("GET /api/events/:id/availability", () => {

    beforeEach(() => {
        jest.spyOn(global, "fetch").mockReset();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test("accessible sans jeton et calcule les places restantes", async () => {
        mockEvent.findUnique.mockResolvedValue({ id: 1, ...VALID_EVENT, maxCapacity: 100 });
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: async () => ({ eventId: 1, confirmedCount: 30, cancelledCount: 2, totalCount: 32 })
        });

        const res = await request(app).get("/api/events/1/availability");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            eventId: 1,
            maxCapacity: 100,
            registeredCount: 30,
            remainingSeats: 70,
            isFull: false
        });
    });

    test("renvoie isFull=true quand la capacite est atteinte", async () => {
        mockEvent.findUnique.mockResolvedValue({ id: 1, ...VALID_EVENT, maxCapacity: 10 });
        global.fetch = jest.fn().mockResolvedValue({
            status: 200,
            json: async () => ({ eventId: 1, confirmedCount: 10, cancelledCount: 0, totalCount: 10 })
        });

        const res = await request(app).get("/api/events/1/availability");

        expect(res.status).toBe(200);
        expect(res.body).toEqual(expect.objectContaining({ remainingSeats: 0, isFull: true }));
    });

    test("rejette un id non entier", async () => {
        const res = await request(app).get("/api/events/abc/availability");

        expect(res.status).toBe(400);
    });

    test("renvoie 404 si l'evenement n'existe pas, sans appeler registrations-service", async () => {
        mockEvent.findUnique.mockResolvedValue(null);
        global.fetch = jest.fn();

        const res = await request(app).get("/api/events/999/availability");

        expect(res.status).toBe(404);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test("renvoie 503 sans valeur optimiste quand registrations-service est injoignable", async () => {
        mockEvent.findUnique.mockResolvedValue({ id: 1, ...VALID_EVENT });
        global.fetch = jest.fn().mockRejectedValue(new Error("network down"));

        const res = await request(app).get("/api/events/1/availability");

        expect(res.status).toBe(503);
        expect(res.body.error).toBe("SERVICE_UNAVAILABLE");
    });

    test("renvoie 503 quand registrations-service repond avec un statut d'erreur", async () => {
        mockEvent.findUnique.mockResolvedValue({ id: 1, ...VALID_EVENT });
        global.fetch = jest.fn().mockResolvedValue({ status: 500, json: async () => ({}) });

        const res = await request(app).get("/api/events/1/availability");

        expect(res.status).toBe(503);
        expect(res.body.error).toBe("SERVICE_UNAVAILABLE");
    });

});
