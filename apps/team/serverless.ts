import "dotenv/config";
import { dirname } from "path";
import { fileURLToPath } from "url";

import { getServerlessConfig } from "@team-tasks/utils";

import type { Serverless } from "serverless/aws";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configurationPromise: Promise<Serverless> = getServerlessConfig({
    directory: __dirname,
    serviceName: "team-tasks-team-service",
    httpPort: "7000",
    apiPrefix: "/teams",
    env: process.env,
});

export default configurationPromise;
