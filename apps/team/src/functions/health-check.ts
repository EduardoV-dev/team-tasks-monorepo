import type { Event } from "serverless/aws";
import type { APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from "aws-lambda";

import {} from "@team-tasks";

const teamServiceHealthCheck = async (
    _event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
    return {
        statusCode: 200,
        body: JSON.stringify({ message: "Team Service is healthy" }),
    };
};

export const event: Event = {
    httpApi: {
        method: "GET",
        path: "/health-check",
    },
};

export default teamServiceHealthCheck;
