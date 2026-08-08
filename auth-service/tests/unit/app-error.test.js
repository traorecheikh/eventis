import AppError from "../../src/utils/app-error.js";

test("porte un status et un message exploitables par le controleur", () => {
    const error = new AppError(409, "Cet email a deja un compte");

    expect(error).toBeInstanceOf(Error);
    expect(error.status).toBe(409);
    expect(error.message).toBe("Cet email a deja un compte");
});
