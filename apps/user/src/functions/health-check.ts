import {
    ApiErrorResponse,
    ApiSuccessResponse,
    registerAPI,
    handleAPI,
    checkServicesHealth,
    HTTP_STATUS,
} from "@team-tasks/utils";

import { db, logger } from "../app.ts";
import { api } from "../openapi/index.ts";

import type { APIGatewayProxyResultV2 } from "aws-lambda";
import type { Event } from "serverless/aws";

const operationId = "health-check";

const healthCheck = async (): Promise<APIGatewayProxyResultV2> => {
    try {
        const { ok, data, error } = await checkServicesHealth({ db });

        if (!ok && error) {
            return error.toJSON();
        }

        return new ApiSuccessResponse(HTTP_STATUS.OK, "User service is healthy", data).toJSON();
    } catch (error) {
        logger.error("Unexpected error during health check", error);

        return new ApiErrorResponse(
            HTTP_STATUS.INTERNAL_SERVER_ERROR,
            "An unexpected error occurred during health check",
        ).toJSON();
    }
};

await registerAPI(api, { [operationId]: healthCheck });

export const event: Event = {
    httpApi: {
        method: "GET",
        path: "/health",
    },
};

export default handleAPI(api);
