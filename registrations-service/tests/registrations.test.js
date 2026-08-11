import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
process.env.JWT_SECRET = "test-secret";
const registration = { findFirst: jest.fn(), create: jest.fn(), findUnique: jest.fn(), update: jest.fn(), findMany: jest.fn(), count: jest.fn(), groupBy: jest.fn() };
const upstream = { getParticipant: jest.fn(), getAvailability: jest.fn(), getEvent: jest.fn() };
jest.unstable_mockModule("../src/config/prisma.js", () => ({ default: { registration } }));
jest.unstable_mockModule("../src/services/upstream.js", () => upstream);
const { default: app } = await import("../src/app.js");
const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
const auth = { Authorization: `Bearer ${token}` };
beforeEach(() => { Object.values(registration).forEach((mock) => mock.mockReset()); Object.values(upstream).forEach((mock) => mock.mockReset()); });

test("POST inscrit apres verification des services", async () => {
  upstream.getParticipant.mockResolvedValue({ status: 200, data: { id: 2 } }); upstream.getAvailability.mockResolvedValue({ status: 200, data: { isFull: false } });
  registration.findFirst.mockResolvedValue(null); registration.create.mockResolvedValue({ id: 3, eventId: 1, participantId: 2, status: "confirmee" });
  expect((await request(app).post("/api/registrations").set(auth).send({ eventId: 1, participantId: 2 })).status).toBe(201);
});
test("POST refuse un evenement complet", async () => {
  upstream.getParticipant.mockResolvedValue({ status: 200 }); upstream.getAvailability.mockResolvedValue({ status: 200, data: { isFull: true } });
  expect((await request(app).post("/api/registrations").set(auth).send({ eventId: 1, participantId: 2 })).body.error).toBe("EVENT_FULL");
});
test("POST refuse un doublon", async () => {
  upstream.getParticipant.mockResolvedValue({ status: 200 }); upstream.getAvailability.mockResolvedValue({ status: 200, data: { isFull: false } }); registration.findFirst.mockResolvedValue({ id: 9 });
  expect((await request(app).post("/api/registrations").set(auth).send({ eventId: 1, participantId: 2 })).body.error).toBe("ALREADY_REGISTERED");
});
test("DELETE annule logiquement", async () => {
  registration.findUnique.mockResolvedValue({ id: 3, status: "confirmee" }); registration.update.mockResolvedValue({ id: 3, status: "annulee" });
  const response = await request(app).delete("/api/registrations/3").set(auth);
  expect(response.status).toBe(200); expect(registration.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: "annulee" }) }));
});
test("stats evenement est public et agrege", async () => {
  registration.groupBy.mockResolvedValue([{ status: "confirmee", _count: { _all: 4 } }, { status: "annulee", _count: { _all: 1 } }]);
  const response = await request(app).get("/api/registrations/stats/event/1");
  expect(response.body).toEqual({ eventId: 1, confirmedCount: 4, cancelledCount: 1, totalCount: 5 });
});
test("stats globales exigent un jeton", async () => { expect((await request(app).get("/api/registrations/stats")).status).toBe(401); });
