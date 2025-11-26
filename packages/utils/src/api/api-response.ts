import { HEADERS } from "../constants/index.ts";

import type { APIGatewayProxyResultV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";

interface APIResponseBody<T> {
    /** Indicates whether the operation succeeded (status code < 400). */
    success: boolean;
    /** Human readable message associated with the outcome. */
    message: string;
    /** Domain data when success; null when failure. */
    data: T | null;
    /** Error payload when failure (mirrors `data` value on error); null on success. */
    error: T | null;
}

type ExtraConfig = Pick<
    APIGatewayProxyStructuredResultV2,
    "cookies" | "headers" | "isBase64Encoded"
>;

interface ApiResponseMethods {
    toJSON(): APIGatewayProxyResultV2;
    setExtraConfig(config: ExtraConfig): this;
}

abstract class ApiResponse<T> implements ApiResponseMethods {
    public readonly success: boolean;
    public readonly statusCode: number;
    public readonly message: string;
    public readonly data: T | null;
    public extraConfig: ExtraConfig;

    constructor(statusCode: number, message: string, data?: T) {
        this.success = statusCode >= 200 && statusCode < 400;
        this.statusCode = statusCode;
        this.message = message;
        this.data = data || null;
        this.extraConfig = {
            headers: HEADERS,
        };
    }

    setExtraConfig(config: ExtraConfig) {
        this.extraConfig = config;
        return this;
    }

    public toJSON(): APIGatewayProxyResultV2 {
        const response: APIResponseBody<T> = {
            success: this.success,
            message: this.message,
            data: this.success ? this.data : null,
            error: this.success ? null : this.data,
        };

        return {
            statusCode: this.statusCode,
            body: JSON.stringify(response),
            ...this.extraConfig,
        };
    }
}

export class ApiSuccessResponse<T> extends ApiResponse<T> {
    constructor(statusCode: number, message: string, data?: T) {
        super(statusCode, message, data);
    }
}

export class ApiErrorResponse<T> extends ApiResponse<T> {
    constructor(statusCode: number, message: string, error?: T) {
        super(statusCode, message, error);
    }
}
