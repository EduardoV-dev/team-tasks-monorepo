import { APIResponse, HTTP_STATUS } from "@team-tasks/utils";

import type { APIGatewayProxyResultV2, APIGatewayProxyEventV2 } from "aws-lambda";
import type { Event } from "serverless";

const teamServiceHealthCheck = async (
    _event: APIGatewayProxyEventV2,
): Promise<APIGatewayProxyResultV2> => {
    return new APIResponse(HTTP_STATUS.OK, "Team Service is healthy").toJSON();
};

export const event: Event = {
    httpApi: {
        method: "GET",
        path: "/health-check",
    },
};

export default teamServiceHealthCheck;
