import { DatabaseConnection } from "@team-tasks/sequelize-orm";
import { createLogger, ENVS, type Logger } from "@team-tasks/utils";

const db = new DatabaseConnection(ENVS.DATABASE_URL || "");
const logger: Logger = createLogger({ level: ENVS.LOG_LEVEL, serviceName: "user-service" });

export { db, logger };
