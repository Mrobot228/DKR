import { TelegrafModuleAsyncOptions } from 'nestjs-telegraf';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { session } from 'telegraf';

export const telegramConfig: TelegrafModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const token = configService.get<string>('BOT_TOKEN');
    if (!token) {
      throw new Error('BOT_TOKEN is not defined in environment variables!');
    }
    return {
      token,
      middlewares: [session()],
      include: [],
    };
  },
};
