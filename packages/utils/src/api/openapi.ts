import {
    OpenAPIBackend,
    type Request,
    type Context,
    type HandlerMap,
    type Document,
} from "openapi-backend";

import { ApiErrorResponse } from "./api-response.ts";
import { HEADERS, HTTP_STATUS } from "../constants/index.ts";

import type { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import type { Event } from "serverless/aws";

/**
 * Handles an API Gateway event using the provided OpenAPIBackend instance.
 * @param api The OpenAPIBackend instance to handle the request.
 * @returns A promise that resolves to an APIGatewayProxyResultV2.
 */
export const handleAPI =
    (api: OpenAPIBackend) =>
    async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const request = {
            method: event.requestContext.http.method,
            path: event.rawPath,
            query: event.queryStringParameters || {},
            body: event.body ? JSON.parse(event.body) : undefined,
            headers: event.headers,
        };

        const response = await api.handleRequest(request as Request);

        return {
            statusCode: response.statusCode,
            headers: response.headers,
            body: response.body,
            cookies: response.cookies,
            isBase64Encoded: response.isBase64Encoded,
        };
    };

/**
 * Registers handlers for the OpenAPIBackend instance.
 * @param api The OpenAPIBackend instance to register handlers for.
 * @param handlerMap A map of handlers to register.
 * @returns A promise that resolves when the handlers have been registered.
 */
export const registerAPI = async (api: OpenAPIBackend, handlerMap: HandlerMap) => {
    api.register({
        validationFail: async (c: Context) =>
            new ApiErrorResponse(HTTP_STATUS.BAD_REQUEST, "Validation failed", {
                errors: c.validation.errors,
            }).toJSON(),
        notFound: async (c: Context) =>
            new ApiErrorResponse(HTTP_STATUS.NOT_FOUND, "Route not found", {
                path: c.request.path,
            }).toJSON(),
        notImplemented: async () =>
            new ApiErrorResponse(HTTP_STATUS.NOT_IMPLEMENTED, "Operation not implemented").toJSON(),
        methodNotAllowed: async (c: Context) =>
            new ApiErrorResponse(HTTP_STATUS.METHOD_NOT_ALLOWED, "Method not allowed", {
                method: c.request.method,
            }).toJSON(),
        unauthorizedHandler: async () =>
            new ApiErrorResponse(HTTP_STATUS.UNAUTHORIZED, "Unauthorized").toJSON(),
        ...handlerMap,
    });

    await api.init();
};

const swaggerUIHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Team Service API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
        html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
        *, *:before, *:after { box-sizing: inherit; }
        body { margin:0; padding:0; }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                url: "/api/openapi.json",
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout"
            });
            window.ui = ui;
        };
    </script>
</body>
</html>
`;

/**
 * Serves the Swagger UI HTML for API documentation.
 * @returns A promise that resolves to an APIGatewayProxyResultV2 containing the HTML.
 */
export const getDocsUIFunction = async (): Promise<APIGatewayProxyResultV2> => ({
    statusCode: HTTP_STATUS.OK,
    headers: { "Content-Type": "text/html" },
    body: swaggerUIHtml,
});

/** Event configuration for the Swagger UI documentation endpoint. */
export const docsUIEvent: Event = {
    httpApi: {
        method: "GET",
        path: "/docs",
    },
};

/** Generates a function to serve the OpenAPI specification as JSON.
 * @param openApiSpec The OpenAPI specification document.
 * @returns A function that returns a promise resolving to an APIGatewayProxyResultV2.
 */
export const getOpenAPISpecFunction =
    (openApiSpec: Document) => async (): Promise<APIGatewayProxyResultV2> => ({
        statusCode: HTTP_STATUS.OK,
        headers: HEADERS,
        body: JSON.stringify(openApiSpec, null, 2),
    });

/** Event configuration for the OpenAPI specification endpoint. */
export const openAPISpecEvent: Event = {
    httpApi: {
        method: "GET",
        path: "/openapi.json",
    },
};
