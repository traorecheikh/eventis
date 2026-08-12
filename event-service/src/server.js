import "dotenv/config";

const REQUIRED_ENV = ["JWT_SECRET", "DATABASE_URL", "REGISTRATIONS_SERVICE_URL"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missing.length > 0) {
    console.error(`Variables d'environnement manquantes : ${missing.join(", ")}`);
    process.exit(1);
}

const { default: prisma } = await import("./config/prisma.js");
const { default: app } = await import("./app.js");

const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        await prisma.$queryRaw`SELECT 1`;

        console.log("Database connected");

        const server = app.listen(PORT, () => {
            console.log(`Event service running on port ${PORT}`);
        });

        server.on("error", (error) => {
            console.error("Echec du demarrage du serveur:", error.message);
            process.exit(1);
        });

    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    }
}

startServer();
