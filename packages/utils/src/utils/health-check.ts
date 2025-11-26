/* eslint-disable @typescript-eslint/no-explicit-any */

import { ApiErrorResponse } from "../api/index.ts";
import { Result } from "../api/result.ts";
import { HTTP_STATUS } from "../constants/api.ts";

interface Resources {
    db: any;
}

interface HealthCheck {
    database: boolean;
}

export const checkServicesHealth = async (resources: Resources): Promise<Result<HealthCheck>> => {
    const isDbConnected = await resources.db.ping();
    const areResoucesHealthy = isDbConnected;

    const resourcesStatus: HealthCheck = {
        database: isDbConnected,
    };

    if (!areResoucesHealthy) {
        return Result.error(
            new ApiErrorResponse(
                HTTP_STATUS.SERVICE_UNAVAILABLE,
                "One or more services are unavailable",
                resourcesStatus,
            ),
        );
    }

    return Result.success(resourcesStatus);
};
