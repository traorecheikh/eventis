import { resolve } from "node:path";
import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.3",
        info: {
            title: "registrations-service",
            version: "1.0.0",
            description: "Inscriptions aux evenements et statistiques. Voir knowledge-base/api/registrations-service.md pour le contrat complet."
        },
        servers: [
            { url: "/api/registrations", description: "Via la passerelle" }
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
