import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';

// Config
import { databaseConfig } from './config/database.config';

// Modules
import { TelegramModule } from './telegram/telegram.module';
import { UsersModule } from './modules/users/users.module';
import { PostOfficesModule } from './modules/post-offices/post-offices.module';
import { ParcelsModule } from './modules/parcels/parcels.module';
import { MapsModule } from './modules/maps/maps.module';

// Scenes
import { FindOfficeScene } from './telegram/scenes/find-office.scene';
import { CreateParcelScene } from './telegram/scenes/create-parcel.scene';
import { TrackParcelScene } from './telegram/scenes/track-parcel.scene';
import { CalculatorScene } from './telegram/scenes/calculator.scene';

// Services
import { PostOfficesService } from './modules/post-offices/post-offices.service';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync(databaseConfig),

    // Telegram Bot
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('BOT_TOKEN');
        if (!token) {
          throw new Error('BOT_TOKEN is not defined! Please set it in .env file.');
        }
        return {
          token,
          middlewares: [session()],
          include: [TelegramModule],
        };
      },
    }),

    // Feature Modules
    TelegramModule,
    UsersModule,
    PostOfficesModule,
    ParcelsModule,
    MapsModule,
  ],
  providers: [
    FindOfficeScene,
    CreateParcelScene,
    TrackParcelScene,
    CalculatorScene,
  ],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly postOfficesService: PostOfficesService) {}

  async onModuleInit() {
    // Заповнюємо тестові дані при першому запуску
    try {
      await this.postOfficesService.seedTestData();
      this.logger.log('Модуль AppModule ініціалізовано');
    } catch (error) {
      this.logger.error('Помилка ініціалізації:', error);
    }
  }
}
