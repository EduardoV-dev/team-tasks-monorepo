import "dotenv/config";

import { getServerlessConfig } from "@team-tasks/utils";
import { Serverless } from "serverless/aws.js";

const configuration = getServerlessConfig({
    directory: __dirname,
    serviceName: "team-tasks-team-service",
    httpPort: "7000",
    apiPrefix: "/teams",
    env: process.env,
}).then((config) => config as Serverless);

export default configuration;
