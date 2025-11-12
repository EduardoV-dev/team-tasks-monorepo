/**
 * Utilities for building consistent API Gateway HTTP responses.
 *
 * The `APIResponse` class wraps domain data (or an error payload) and converts it
 * into a JSON string representing an `APIGatewayProxyResultV2` object.
 *
 * Error classification is inferred from the numeric HTTP status code: any code
 * between 400–599 (inclusive of 400, exclusive of 600) is treated as an error.
 *
 * Note: In this implementation the `Result` base class receives the payload in the
 * `data` slot even for error cases (and `error` is kept `null`). The `toJSON` method
 * then conditionally maps that payload to either `data` or `error` field in the final
 * body structure. This allows using arbitrary error shapes (not just `Error` objects).
 */
import { Result } from "./result.ts";

import type { APIGatewayProxyResultV2 } from "aws-lambda";

/**
 * Shape of the body returned by the API (wrapped inside the API Gateway result).
 * @template T Type of the successful data payload (or error payload if failure).
 */
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

/**
 * API Response builder for AWS API Gateway (HTTP API v2).
 * @template T Type of the payload provided by the handler.
 */
export class APIResponse<T> extends Result<T> {
    private statusCode: number;
    private message: string;

    /**
     * @param statusCode HTTP status code to return.
     * @param message Human readable summary of the result.
     * @param data Domain data (on success) or an error payload (on failure).
     */
    constructor(statusCode: number, message: string, data?: T) {
        super(statusCode >= 100 && statusCode < 400, data || null, null);

        this.statusCode = statusCode;
        this.message = message;
    }

    /**
     * Serializes the response into a stringified `APIGatewayProxyResultV2` object.
     * @returns JSON string representing `{ statusCode, body }` compatible with AWS Lambda.
     */
    public toJSON(): APIGatewayProxyResultV2 {
        const response: APIResponseBody<T> = {
            success: this.ok,
            message: this.message,
            data: this.ok ? this.data : null,
            error: !this.ok ? this.data : null,
        };

        return {
            statusCode: this.statusCode,
            body: JSON.stringify(response),
        };
    }
}
