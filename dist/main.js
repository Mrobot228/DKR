"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const logger = new common_1.Logger('Bootstrap');
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['log', 'error', 'warn', 'debug'],
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.enableCors();
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3000);
    await app.listen(port);
    logger.log(`🚀 Сервер запущено на порті ${port}`);
    logger.log(`🤖 Telegram бот успішно запущено!`);
}
bootstrap().catch((error) => {
    console.error('Помилка запуску:', error);
    process.exit(1);
});
//# sourceMappingURL=main.js.map