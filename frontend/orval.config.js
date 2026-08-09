export default {
    auth: {
        input: "../auth-service/openapi.json",
        output: {
            mode: "tags-split",
            target: "./src/api/generated/auth",
            client: "axios",
            baseUrl: "/auth",
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
            override: {
                mutator: {
                    path: "./src/api/axios-instance.js",
                    name: "customInstance"
                }
            }
        }
    }
};
