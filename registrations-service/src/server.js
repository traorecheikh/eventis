import "dotenv/config";
const required = ["JWT_SECRET", "DATABASE_URL", "EVENTS_SERVICE_URL", "PARTICIPANTS_SERVICE_URL"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) { console.error(`Variables d'environnement manquantes : ${missing.join(", ")}`); process.exit(1); }
const { default: prisma } = await import("./config/prisma.js"); const { default: app } = await import("./app.js");
try { await prisma.$queryRaw`SELECT 1`; app.listen(process.env.PORT || 3003, () => console.log(`Registrations service running on port ${process.env.PORT || 3003}`)); }
catch (error) { console.error("Database connection failed:", error.message); process.exit(1); }
