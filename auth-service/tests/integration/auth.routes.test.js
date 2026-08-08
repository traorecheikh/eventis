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
    await prisma.user.deleteMany();
});


test("parcours complet : inscription puis connexion puis /me protege", async () => {

    const register = await request(app)
        .post("/api/auth/register")
        .send({ email: "integ@dit.sn", password: "MotDePasse123", role: "participant" });

    expect(register.status).toBe(201);
    expect(register.body.token).toBeDefined();
    expect(register.body.user.email).toBe("integ@dit.sn");

    const login = await request(app)
        .post("/api/auth/login")
        .send({ email: "integ@dit.sn", password: "MotDePasse123" });

    expect(login.status).toBe(200);
    expect(login.body.token).toBeDefined();

    const me = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${login.body.token}`);

    expect(me.status).toBe(200);
    expect(me.body.user.email).toBe("integ@dit.sn");
});

test("/me sans jeton renvoie 401", async () => {

    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
});

test("inscription avec email deja utilise renvoie 409, pas de fuite d'information", async () => {

    await request(app)
        .post("/api/auth/register")
        .send({ email: "dup@dit.sn", password: "MotDePasse123", role: "participant" });

    const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "dup@dit.sn", password: "AutreMotDePasse456", role: "organisateur" });

    expect(res.status).toBe(409);
});
