import path from "path";
import { pathToFileURL } from "url";

import { sync as globSync } from "glob";

import { loadEnvironmentVariables } from "./environment-variables.ts";
import { slugify } from "../utils/slugify.ts";

import type { Functions, Serverless } from "serverless/aws";

interface OpenApiDocs {
    enable?: boolean;
    functionFile?: string;
}

interface ServerlessConfigOptions {
    /** The name of the service */
    serviceName: string;
    /** The HTTP port for serverless-offline */
    httpPort: string;
    /** The directory of the serverless project */
    directory: string;
    /** Environment variables to inject into the functions and serverless configuration */
    env: { [key: string]: string | undefined };
    /** Configuration options for OpenAPI documentation */
    openApiDocs?: OpenApiDocs;
}

const DEFAULT_OPENAPI_FUNCTION_FILE = "docs.ts";

/**
 * Generates a Serverless configuration object with dynamic function loading.
 * all HTTP API routes include a base prefix of `/api`.
 * @param options - Configuration options for the Serverless setup.
 * @returns A Serverless configuration object.
 */
export const getServerlessConfig = async ({
    directory,
    env,
    httpPort,
    serviceName,
    openApiDocs,
}: ServerlessConfigOptions): Promise<Serverless> => {
    const openApiDocsGlobPattern = `${FUNCTIONS_DIR}/**/${openApiDocs?.functionFile || DEFAULT_OPENAPI_FUNCTION_FILE}`;

    const [openapiDocs, functions] = await Promise.all([
        loadFunctions({
            directory,
            inclusions: [openApiDocsGlobPattern],
        }),
        loadFunctions({
            directory,
            apiPrefix: "/api",
            inclusions: [`${FUNCTIONS_DIR}/**/*.ts`],
            exclusions: [openApiDocsGlobPattern],
        }),
    ]);

    const lambdaPort = String(Number(httpPort) - 1000);

    const config = {
        service: serviceName,
        frameworkVersion: "4",
        provider: {
            httpApi: {
                cors: true,
            },
            name: "aws",
            region: "us-east-1",
            runtime: env?.["RUNTIME"] || "nodejs22.x",
            stage: env?.["ENVIRONMENT"] || "development",
            environment: loadEnvironmentVariables(env),
        },
        custom: { "serverless-offline": { httpPort, lambdaPort } },
        functions: { ...openapiDocs, ...functions },
        plugins: ["serverless-offline"],
        package: {
            individually: true,
        },
        build: {
            esbuild: {
                bundle: true,
                minify: true,
                sourcemap: false,
                platform: "node",
                format: "esm",
                mainFields: ["module", "main"],
                external: ["pg-hstore", "pg", "mysql2", "oracledb", "tedious"],
                banner: {
                    js: "import { createRequire } from 'module';const require = createRequire(import.meta.url);",
                },
            },
        },
    } as Serverless;

    return config;
};

// ==== Inner functions loader ====

const FUNCTIONS_DIR = "src/functions";

interface LoadFunctionsParams {
    directory: string;
    inclusions: string[];
    apiPrefix?: string;
    exclusions?: string[];
}

/**
 * Dynamically loads serverless functions from the specified directory.
 * Excludes any files specified in the `excludeFiles` array.
 * @param params - Parameters for loading functions.
 * @returns An object containing the loaded functions.
 */
const loadFunctions = async ({
    directory,
    inclusions,
    apiPrefix = "",
    exclusions = [],
}: LoadFunctionsParams): Promise<Functions> => {
    const dirPath = path.resolve(directory, FUNCTIONS_DIR);

    const functionFiles = globSync(inclusions, {
        ignore: exclusions,
    }).map((file) => path.relative(FUNCTIONS_DIR, file));

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
                            path: apiPrefix + event.httpApi.path,
                        },
                    }),
                },
            ],
        };
    }

    return functions;
};
