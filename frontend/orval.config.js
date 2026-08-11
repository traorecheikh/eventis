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
    },
    participants: {
        input: "../participants-service/openapi.json",
        output: {
            mode: "tags-split",
            target: "./src/api/generated/participants",
            client: "axios",
            baseUrl: "/participants",
            clean: true,
            override: {
                mutator: {
                    path: "./src/api/axios-instance.js",
                    name: "customInstance"
                }
            }
        }
    },
    registrations: {
        input: "../registrations-service/openapi.json",
        output: {
            mode: "tags-split",
            target: "./src/api/generated/registrations",
            client: "axios",
            baseUrl: "/registrations",
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
