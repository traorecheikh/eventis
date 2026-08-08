import { execSync, spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const CONTAINER = "eventis-auth-db-dev";
const DB_PORT = 5432;
const DB_USER = "auth_user";
const DB_NAME = "auth";
const DB_URL = `postgresql://${DB_USER}:devpassword@localhost:${DB_PORT}/${DB_NAME}`;

function sh(cmd, opts = {}) {
    return execSync(cmd, { stdio: "inherit", ...opts });
}

function shSilent(cmd) {
    try {
        return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    } catch {
        return "";
    }
}

if (!shSilent("docker info")) {
    console.error("Docker n'est pas lance. Demarrer Docker puis relancer npm run dx.");
    process.exit(1);
}

const running = shSilent(`docker ps --filter "name=^${CONTAINER}$" --format "{{.Names}}"`) === CONTAINER;
const exists = shSilent(`docker ps -a --filter "name=^${CONTAINER}$" --format "{{.Names}}"`) === CONTAINER;

if (!running) {

    if (exists) {
        console.log(`Redemarrage de ${CONTAINER}...`);
        sh(`docker start ${CONTAINER}`);
    } else {
        console.log(`Creation de ${CONTAINER} (PostgreSQL 16, port ${DB_PORT})...`);
        sh(
            `docker run -d --name ${CONTAINER} ` +
            `-e POSTGRES_USER=${DB_USER} -e POSTGRES_PASSWORD=devpassword -e POSTGRES_DB=${DB_NAME} ` +
            `-p ${DB_PORT}:5432 postgres:16-alpine`
        );
    }

    console.log("Attente de PostgreSQL...");

    for (let i = 0; i < 30; i++) {
        if (shSilent(`docker exec ${CONTAINER} pg_isready -U ${DB_USER}`).includes("accepting connections")) {
            break;
        }
        sh("sleep 1");
    }

} else {
    console.log(`${CONTAINER} deja actif.`);
}

if (!existsSync(".env")) {
    console.log(".env absent, generation depuis .env.example avec des valeurs de dev...");

    let env = readFileSync(".env.example", "utf8");
    env = env.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL=${DB_URL}`);
    env = env.replace(/^JWT_SECRET=.*$/m, "JWT_SECRET=dev-secret-ne-pas-utiliser-en-production");

    writeFileSync(".env", env);
}

console.log("Synchronisation du schema Prisma...");
sh("npx prisma migrate dev", { env: { ...process.env, DATABASE_URL: DB_URL } });

console.log("Demarrage du serveur en mode dev (npm run dev)...");
spawn("npx", ["nodemon", "src/server.js"], { stdio: "inherit", shell: true });
