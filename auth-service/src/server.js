import "dotenv/config";

const REQUIRED_ENV = ["JWT_SECRET", "DATABASE_URL"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Variables d'environnement manquantes : ${missing.join(", ")}`);
  process.exit(1);
}

const { default: prisma } = await import("./config/prisma.js");
const { default: app } = await import("./app.js");

const PORT = process.env.PORT || 3004;

async function startServer() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    console.log("Database connected");

    app.listen(PORT, () => {
      console.log(`Auth service running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
