import jwt from "jsonwebtoken";
import request from "supertest";

// Necessite une vraie base PostgreSQL migree, fournie via DATABASE_URL
// (voir .github/workflows/ci.yml : service postgres ephemere + prisma migrate deploy).

let app;
let prisma;

beforeAll(async () => {
    ({ default: app } = await import("../../src/app.js"));
    ({ default: prisma } = await import("../../src/config/prisma.js"));
});

afterAll(async () => {
    await prisma.$disconnect();
});

beforeEach(async () => {
    await prisma.event.deleteMany();
});

function token() {
    return jwt.sign({ id: 7, email: "int@test.sn", role: "organisateur" }, process.env.JWT_SECRET, { expiresIn: "1h" });
}


test("cree un evenement puis le retrouve dans la liste publique paginee", async () => {

    const created = await request(app)
        .post("/api/events")
        .set("Authorization", `Bearer ${token()}`)
        .send({
            title: "Conference integration",
            description: "test integration reel",
            date: "2099-06-01T00:00:00.000Z",
            location: "Dakar",
            maxCapacity: 30
        });

    expect(created.status).toBe(201);
    expect(created.body.id).toBeDefined();

    const list = await request(app).get("/api/events");

    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.data[0].title).toBe("Conference integration");
    expect(list.body.pagination.total).toBe(1);
});
