import { DataSource } from "typeorm";

export const mainDataSource = new DataSource({
    type: 'sqlite',
    database: ":memory:",
    synchronize: true,
    logging: false,
    entities: ['src/entity/**/*.ts'],
    migrations: []
})