import { Sequelize } from "sequelize";

export class DatabaseConnection {
    public sequelize: Sequelize;

    constructor(connectionString: string) {
        this.sequelize = new Sequelize(connectionString, {
            dialect: "postgres",
            logging: false,
        });
    }

    public async ping(): Promise<boolean> {
        try {
            await this.sequelize.authenticate();
            return true;
        } catch (error) {
            return false;
        }
    }
}
