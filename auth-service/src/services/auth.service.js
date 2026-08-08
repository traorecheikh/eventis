import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";
import AppError from "../utils/app-error.js";

const VALID_ROLES = ["organisateur", "participant"];
const UNIQUE_CONSTRAINT = "P2002";

function signToken(user) {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "24h"
        }
    );
}

function toPublicUser(user) {
    return {
        id: user.id,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    };
}

export async function register({ email, password, role }) {

    if (!email || !password) {
        throw new AppError(400, "email et password sont requis");
    }

    if (!VALID_ROLES.includes(role)) {
        throw new AppError(400, `role doit etre l'un de : ${VALID_ROLES.join(", ")}`);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    let user;

    try {

        user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                role
            }
        });

    } catch (error) {

        if (error.code === UNIQUE_CONSTRAINT) {
            throw new AppError(409, "Cet email a deja un compte");
        }

        throw error;

    }

    return {
        user: toPublicUser(user),
        token: signToken(user),
        expiresIn: 86400
    };

}




export async function login({ email, password }) {

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {

        throw new AppError(401, "Identifiants incorrects");

    }

    const validPassword = await bcrypt.compare(
        password,
        user.passwordHash
    );


    if (!validPassword) {

        throw new AppError(401, "Identifiants incorrects");

    }

    await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() }
    });


    return {

        token: signToken(user),

        user: toPublicUser(user)

    };

}
