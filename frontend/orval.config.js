export default {
    auth: {
        input: "../auth-service/openapi.json",
        output: {
            mode: "tags-split",
            target: "./src/api/generated/auth",
            client: "axios",
            baseUrl: "/auth",
            clean: true,
            override: {
                mutator: {
                    path: "./src/api/axios-instance.js",
                    name: "customInstance"
                }
            }
        }
    },
    events: {
        input: "../event-service/openapi.json",
        output: {
            mode: "tags-split",
            target: "./src/api/generated/events",
            client: "axios",
            baseUrl: "/events",
            clean: true,
            override: {
                mutator: {
                    path: "./src/api/axios-instance.js",
                    name: "customInstance"
                }
            }
        }
    }
};
