import type { Serverless, Functions } from "serverless/aws";

const configuration: Serverless = {
    service: "team-app",
    frameworkVersion: "4",
    provider: {
        httpApi: {
            cors: true,
        },
        name: "aws",
        region: "us-east-1",
        runtime: "nodejs22.x",
        stage: "${opt:stage, 'dev'}",
    },
    custom: {
        "serverless-offline": {
            httpPort: "7000",
        },
    },
    functions: {} as Functions,
    plugins: ["serverless-offline"],
};

export default configuration;
