import { resolve } from "node:path";
import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "participants-service",
            version: "1.0.0",
            description: "Gestion des profils participants. Voir knowledge-base/api/participants-service.md pour le contrat complet."
        },
        servers: [
            { url: "/api/participants", description: "Via la passerelle" }
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
