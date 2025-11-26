import { createLogger as createWinstonLogger, format, transports, type Logger } from "winston";

const TIMESTAMP_FORMAT = "YYYY-MM-DD HH:mm:ss";

const LOG_FILES = {
    APP: "logs/app.log",
    ERROR: "logs/error.log",
    EXCEPTION: "logs/exception.log",
    REJECTION: "logs/rejection.log",
};

interface CreateLoggerParams {
    level?: string;
    serviceName?: string;
}

export const createLogger = ({ level = "info", serviceName = "" }: CreateLoggerParams) =>
    createWinstonLogger({
        level,
        defaultMeta: { service: serviceName },
        format: format.combine(
            format.timestamp({ format: TIMESTAMP_FORMAT }),
            format.errors({ stack: true }),
            format.splat(),
            format.json(),
        ),
        transports: [
            new transports.Console({
                format: format.combine(
                    format.colorize(),
                    format.printf(({ level, message, timestamp, stack }) => {
                        return `${timestamp} [${level}]: ${stack || message}`;
                    }),
                ),
            }),
            new transports.File({ filename: LOG_FILES.APP }),
            new transports.File({ filename: LOG_FILES.ERROR, level: "error" }),
        ],
        exceptionHandlers: [new transports.File({ filename: LOG_FILES.EXCEPTION })],
        rejectionHandlers: [new transports.File({ filename: LOG_FILES.REJECTION })],
    });

export type { Logger };

export const logger = createLogger({});
