export default {
    ApiSuccessResponse: {
        type: "object",
        required: ["success", "message"],
        properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Operation completed successfully." },
            data: { type: "object", nullable: true, example: {} },
            error: { type: "object", nullable: true, example: null },
        },
    },
    ApiErrorResponse: {
        type: "object",
        required: ["success", "message"],
        properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "An error occurred." },
            data: { type: "object", nullable: true, example: null },
            error: { type: "object", nullable: true, example: {} },
        },
    },
};
