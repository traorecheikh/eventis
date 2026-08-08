import { jest } from "@jest/globals";
import bcrypt from "bcrypt";
import AppError from "../../src/utils/app-error.js";

const mockUser = {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
};

jest.unstable_mockModule("../../src/config/prisma.js", () => ({
    default: { user: mockUser }
}));

const { register, login } = await import("../../src/services/auth.service.js");

beforeEach(() => {
    mockUser.create.mockReset();
    mockUser.findUnique.mockReset();
    mockUser.update.mockReset();
    process.env.JWT_SECRET = "test-secret-not-used-in-prod";
});


describe("auth.service.register", () => {

    test("rejette un email ou mot de passe manquant", async () => {
        await expect(register({ email: "", password: "", role: "participant" }))
            .rejects.toMatchObject({ status: 400 });

        expect(mockUser.create).not.toHaveBeenCalled();
    });

    test("rejette un role hors enumeration (tentative d'escalade de privilege)", async () => {
        await expect(register({ email: "a@a.sn", password: "pw123456", role: "admin" }))
            .rejects.toMatchObject({ status: 400 });

        expect(mockUser.create).not.toHaveBeenCalled();
    });

    test("accepte les deux roles documentes dans le contrat", async () => {
        mockUser.create.mockResolvedValue({
            id: 1, email: "a@a.sn", role: "organisateur", createdAt: new Date()
        });

        await expect(register({ email: "a@a.sn", password: "pw123456", role: "organisateur" }))
            .resolves.toBeDefined();
    });

    test("hache le mot de passe avant stockage, jamais en clair", async () => {
        mockUser.create.mockResolvedValue({
            id: 1, email: "a@a.sn", role: "participant", createdAt: new Date()
        });

        await register({ email: "a@a.sn", password: "pw123456", role: "participant" });

        const callArgs = mockUser.create.mock.calls[0][0];

        expect(callArgs.data.passwordHash).not.toBe("pw123456");
        expect(callArgs.data.passwordHash).toMatch(/^\$2[aby]\$/);
    });

    test("renvoie 409 sur email deja utilise (contrainte unique Prisma)", async () => {
        const prismaError = Object.assign(new Error("Unique constraint failed"), { code: "P2002" });
        mockUser.create.mockRejectedValue(prismaError);

        await expect(register({ email: "dup@a.sn", password: "pw123456", role: "participant" }))
            .rejects.toMatchObject({ status: 409 });
    });

    test("propage les erreurs inattendues sans les transformer en erreur client", async () => {
        mockUser.create.mockRejectedValue(new Error("connexion base de donnees perdue"));

        await expect(register({ email: "a@a.sn", password: "pw123456", role: "participant" }))
            .rejects.toThrow("connexion base de donnees perdue");

        try {
            await register({ email: "a@a.sn", password: "pw123456", role: "participant" });
        } catch (error) {
            expect(error).not.toBeInstanceOf(AppError);
            expect(error.status).toBeUndefined();
        }
    });

    test("renvoie un jeton signe et jamais le hash du mot de passe", async () => {
        mockUser.create.mockResolvedValue({
            id: 5,
            email: "a@a.sn",
            role: "participant",
            passwordHash: "ne-doit-jamais-sortir",
            createdAt: new Date()
        });

        const result = await register({ email: "a@a.sn", password: "pw123456", role: "participant" });

        expect(typeof result.token).toBe("string");
        expect(result.expiresIn).toBe(86400);
        expect(result.user.passwordHash).toBeUndefined();
    });

});


describe("auth.service.login", () => {

    test("email inconnu renvoie le meme message generique qu'un mauvais mot de passe (anti enumeration)", async () => {
        mockUser.findUnique.mockResolvedValue(null);

        await expect(login({ email: "fantome@a.sn", password: "peu-importe" }))
            .rejects.toMatchObject({ status: 401, message: "Identifiants incorrects" });
    });

    test("mauvais mot de passe renvoie le meme message generique qu'un email inconnu", async () => {
        mockUser.findUnique.mockResolvedValue({
            id: 1,
            email: "a@a.sn",
            role: "participant",
            passwordHash: await bcrypt.hash("bon-mot-de-passe", 10)
        });

        await expect(login({ email: "a@a.sn", password: "mauvais" }))
            .rejects.toMatchObject({ status: 401, message: "Identifiants incorrects" });
    });

    test("identifiants corrects renvoient un jeton et mettent a jour lastLoginAt", async () => {
        const passwordHash = await bcrypt.hash("bon-mot-de-passe", 10);

        mockUser.findUnique.mockResolvedValue({
            id: 1, email: "a@a.sn", role: "participant", passwordHash
        });
        mockUser.update.mockResolvedValue({});

        const result = await login({ email: "a@a.sn", password: "bon-mot-de-passe" });

        expect(typeof result.token).toBe("string");
        expect(result.user.email).toBe("a@a.sn");
        expect(mockUser.update).toHaveBeenCalledWith(
            expect.objectContaining({ where: { id: 1 } })
        );
    });

});
