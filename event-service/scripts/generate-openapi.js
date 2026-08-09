import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import swaggerSpec from "../src/config/swagger.js";

const outputPath = resolve(import.meta.dirname, "../openapi.json");

writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2) + "\n");

console.log(`openapi.json genere depuis les annotations @openapi de src/routes/ (${outputPath}).`);
