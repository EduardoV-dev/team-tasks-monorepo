import path from "path";
import { pathToFileURL } from "url";

import { sync as globSync } from "glob";

import { slugify } from "../utils/slugify.ts";

import type { Functions, Serverless } from "serverless/aws";

interface ServerlessConfigOptions {
    /** The name of the service */
    serviceName: string;
    /** The HTTP port for serverless-offline */
    httpPort: string;
    /** The directory of the serverless project */
    directory: string;
    /** Optional API prefix for all HTTP API routes */
    apiPrefix?: string;
    /** Environment variables to inject into the functions and serverless configuration */
    env: { [key: string]: string | undefined };
}

/**
 * Generates a Serverless configuration object with dynamic function loading.
 * all HTTP API routes include a base prefix of `/api`.
 * @param options - Configuration options for the Serverless setup.
 * @returns A Serverless configuration object.
 */
export const getServerlessConfig = async ({
    serviceName,
    httpPort,
    directory,
    env,
    apiPrefix = "",
}: ServerlessConfigOptions): Promise<Serverless> => ({
    service: serviceName,
    frameworkVersion: "4",
    provider: {
        httpApi: {
            cors: true,
        },
        name: "aws",
        region: "us-east-1",
        runtime: env?.["RUNTIME"] || "nodejs22.x",
        stage: env?.["ENVIRONMENT"] || "dev",
        environment: {
            ENVIRONMENT: env?.["ENVIRONMENT"] || "dev",
        },
    },
    custom: { "serverless-offline": { httpPort } },
    functions: await loadFunctions(directory, apiPrefix),
    plugins: ["serverless-offline"],
});

// ==== Inner functions loader ====

const FUNCTIONS_DIR = "src/functions";
const BASE_API_PREFIX = "/api";

/**
 * Dynamically loads serverless functions from the specified directory.
 * @param apiPrefix - Optional prefix to add to all HTTP API routes.
 * @returns An object containing the loaded functions.
 */
const loadFunctions = async (directory: string, apiPrefix: string): Promise<Functions> => {
    const dirPath = path.resolve(directory, FUNCTIONS_DIR);

    const functionFiles = globSync(`${FUNCTIONS_DIR}/**/*.ts`).map((file) =>
        path.relative(FUNCTIONS_DIR, file),
    );

    const functions: Functions = {};

    for (const file of functionFiles) {
        const fileName = file.replace(".ts", "");
        const fullPath = path.resolve(dirPath, file);
        const module = await import(pathToFileURL(fullPath).href);
        const handler = module.default;

        if (!handler) {
            throw new Error(
                `Handler file "${FUNCTIONS_DIR}/${file}" must export a default handler function. Example: export default async function handler(event) { ... }`,
            );
        }

        const event = module.event;

        if (!event) {
            throw new Error(
                `Handler file "${FUNCTIONS_DIR}/${file}" must export an "event" (object or array). Example: export const event = { httpApi: { path: "/foo", method: "get" } };`,
            );
        }

        if (fileName in functions) {
            throw new Error(
                `Duplicate handler filename "${fileName}" found in "${FUNCTIONS_DIR}/${file}". Each handler must have a unique name.`,
            );
        }

        const slug = slugify(fileName);

        functions[slug] = {
            handler: `${FUNCTIONS_DIR}/${fileName}.default`,
            events: [
                {
                    ...event,
                    ...(event.httpApi && {
                        httpApi: {
                            ...event.httpApi,
                            path: BASE_API_PREFIX + apiPrefix + event.httpApi.path,
                        },
                    }),
                },
            ],
        };
    }

    return functions;
};
