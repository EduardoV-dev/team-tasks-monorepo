import "dotenv/config";
import { dirname } from "path";
import { fileURLToPath } from "url";

import { getServerlessConfig } from "@team-tasks/utils";

import "./src/app.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configurationPromise = getServerlessConfig({
    directory: __dirname,
    serviceName: "team-tasks-user-service",
    httpPort: process.env["LOCAL_PORT"] || "7000",
    env: process.env,
    openApiDocs: { enable: true },
});

export default configurationPromise;
