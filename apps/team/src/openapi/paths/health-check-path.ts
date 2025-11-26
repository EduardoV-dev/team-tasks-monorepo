export default {
    "/api/health": {
        get: {
            summary: "Health Check",
            description: "Checks the health status of the API.",
            operationId: "health-check",
            tags: ["Health"],
            responses: {
                "200": {
                    description: "API is healthy",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ApiSuccessResponse",
                            },
                        },
                    },
                },
            },
        },
    },
};
