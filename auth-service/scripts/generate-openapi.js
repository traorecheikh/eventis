import { writeFileSync } from "node:fs";
import swaggerSpec from "../src/config/swagger.js";

writeFileSync("./openapi.json", JSON.stringify(swaggerSpec, null, 2) + "\n");

console.log("openapi.json genere depuis les annotations @openapi de src/routes/.");
