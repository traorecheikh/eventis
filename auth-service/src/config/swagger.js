import { resolve } from "node:path";
import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "auth-service",
            version: "1.0.0",
            description: "Comptes, connexion, emission et verification des jetons JWT. Voir knowledge-base/api/auth-service.md pour le contrat complet."
        },
        servers: [
            { url: "/api/auth", description: "Via la passerelle" }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: [resolve(import.meta.dirname, "../routes/*.js")]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
