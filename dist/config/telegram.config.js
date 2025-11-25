"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.telegramConfig = void 0;
const config_1 = require("@nestjs/config");
const telegraf_1 = require("telegraf");
exports.telegramConfig = {
    imports: [config_1.ConfigModule],
    inject: [config_1.ConfigService],
    useFactory: (configService) => {
        const token = configService.get('BOT_TOKEN');
        if (!token) {
            throw new Error('BOT_TOKEN is not defined in environment variables!');
        }
        return {
            token,
            middlewares: [(0, telegraf_1.session)()],
            include: [],
        };
    },
};
//# sourceMappingURL=telegram.config.js.map