import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  // Railway встановлює PORT автоматично
  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');
  
  logger.log(`🚀 Сервер запущено на порті ${port}`);
  logger.log(`🤖 Telegram бот успішно запущено!`);
}

bootstrap().catch((error) => {
  console.error('Помилка запуску:', error);
  process.exit(1);
});
