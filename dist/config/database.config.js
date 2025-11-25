"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseConfig = void 0;
const config_1 = require("@nestjs/config");
exports.databaseConfig = {
    imports: [config_1.ConfigModule],
    inject: [config_1.ConfigService],
    useFactory: (configService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'post_office_bot'),
        entities: [__dirname + '/../database/entities/*.entity{.ts,.js}'],
        synchronize: true,
        logging: configService.get('NODE_ENV') === 'development',
        autoLoadEntities: true,
    }),
};
//# sourceMappingURL=database.config.js.map