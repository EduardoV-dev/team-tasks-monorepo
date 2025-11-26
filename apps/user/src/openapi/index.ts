import { ENVS } from "@team-tasks/utils";
import { OpenAPIBackend } from "openapi-backend";

import paths from "./paths/index.ts";
import schemas from "./schemas/index.ts";

export const openApiSpec = {
    openapi: "3.0.0",
    info: {
        title: "User Service API",
        version: "1.0.0",
        description: "Microservice for managing users",
    },
    servers: [
        {
            url: `http://localhost:${ENVS.LOCAL_PORT}`,
            description: "Local development",
        },
    ],
    paths,
    components: {
        schemas,
    },
};

export const api = new OpenAPIBackend({
    definition: openApiSpec as never,
    quick: true,
    strict: false,
    validate: true,
});
