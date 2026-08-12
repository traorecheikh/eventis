import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
process.env.JWT_SECRET = "test-secret";
const model = { create: jest.fn(), findMany: jest.fn(), count: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() };
jest.unstable_mockModule("../src/config/prisma.js", () => ({ default: { participant: model } }));
const { default: app } = await import("../src/app.js");
const token = jwt.sign({ id: 1, role: "organisateur" }, process.env.JWT_SECRET);
beforeEach(() => Object.values(model).forEach((mock) => mock.mockReset()));

test("GET /health expose l'etat du service", async () => {
  const response = await request(app).get("/health");
  expect(response.status).toBe(200); expect(response.body.database).toBe("connected");
});
test("POST cree et normalise un participant", async () => {
  model.create.mockResolvedValue({ id: 1 });
  const response = await request(app).post("/api/participants").send({ name: " Awa Diallo ", email: "AWA@DIT.SN", phone: "+221770000000", type: "etudiant" });
  expect(response.status).toBe(201); expect(model.create).toHaveBeenCalledWith({ data: expect.objectContaining({ email: "awa@dit.sn", name: "Awa Diallo" }) });
});
test("POST rejette un type invalide", async () => {
  expect((await request(app).post("/api/participants").send({ name: "Awa", email: "awa@dit.sn", type: "admin" })).status).toBe(400);
});
test("POST traduit l'unicite email en conflit", async () => {
  model.create.mockRejectedValue({ code: "P2002" });
  expect((await request(app).post("/api/participants").send({ name: "Awa", email: "awa@dit.sn", type: "externe" })).status).toBe(409);
});
test("GET liste exige un jeton", async () => { expect((await request(app).get("/api/participants")).status).toBe(401); });
test("GET liste renvoie la pagination", async () => {
  model.findMany.mockResolvedValue([]); model.count.mockResolvedValue(0);
  const response = await request(app).get("/api/participants").set("Authorization", `Bearer ${token}`);
  expect(response.status).toBe(200); expect(response.body.pagination.limit).toBe(20);
});
test("GET search exige un critere", async () => {
  expect((await request(app).get("/api/participants/search").set("Authorization", `Bearer ${token}`)).status).toBe(400);
});
test("PUT renvoie 404 si absent", async () => {
  model.update.mockRejectedValue({ code: "P2025" });
  expect((await request(app).put("/api/participants/42").set("Authorization", `Bearer ${token}`).send({ name: "Nouveau nom" })).status).toBe(404);
});
test("DELETE effectue une suppression physique", async () => {
  model.delete.mockResolvedValue({});
  expect((await request(app).delete("/api/participants/1").set("Authorization", `Bearer ${token}`)).status).toBe(204);
});
