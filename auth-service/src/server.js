require("dotenv").config();

const app = require("./app");
const pool = require("./config/database");

const PORT = process.env.PORT || 3004;

async function startServer() {
  try {
    await pool.query("SELECT NOW()");

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