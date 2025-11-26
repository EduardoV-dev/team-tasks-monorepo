interface EnvironmentVariables {
    DATABASE_URL: string | undefined;
    ENVIRONMENT: string | undefined;
    LOCAL_PORT: string | undefined;
    RUNTIME: string | undefined;
    LOG_LEVEL: string | undefined;
}

/**
 * Use in serverless configuration to load environment variables.
 * @param processEnv - Send process.env object
 * @returns An object containing the environment variables.
 */
export const loadEnvironmentVariables = (
    processEnv: Record<string, string | undefined>,
): EnvironmentVariables => formEnvs(processEnv);

/**
 * The frozen environment variables object.
 * This object is immutable and can be safely imported and used across the application.
 */
export const ENVS: Readonly<EnvironmentVariables> = Object.freeze(formEnvs());

/**
 * Forms the environment variables object from the provided process environment or the actual process.env
 * @param processEnv - Optional process environment to use; defaults to `process.env`.
 * @returns An object containing the environment variables.
 */
function formEnvs(processEnv?: Record<string, string | undefined>): EnvironmentVariables {
    const env = processEnv || process.env;

    return {
        DATABASE_URL: env["DATABASE_URL"] || "",
        ENVIRONMENT: env["ENVIRONMENT"] || "",
        LOCAL_PORT: env["LOCAL_PORT"] || "",
        RUNTIME: env["RUNTIME"] || "",
        LOG_LEVEL: env["LOG_LEVEL"] || "",
    };
}
