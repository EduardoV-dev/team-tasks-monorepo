import type { APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from "aws-lambda";
import type { Event } from "serverless";

const teamServiceHealthCheck = async (
    _event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Team Service is healthy",
            environment: process.env["ENVIRONMENT"] || "not set",
        }),
    };
};

export const event: Event = {
    httpApi: {
        method: "GET",
        path: "/health-check",
    },
};

export default teamServiceHealthCheck;
