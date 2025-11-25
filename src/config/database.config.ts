import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => ({
    type: 'postgres',
    url: configService.get<string>('DATABASE_URL'),
    entities: [__dirname + '/../database/entities/*.entity{.ts,.js}'],
    synchronize: true,
    logging: configService.get<string>('NODE_ENV') === 'development',
    autoLoadEntities: true,
    ssl: configService.get<string>('NODE_ENV') === 'production' 
      ? { rejectUnauthorized: false } 
      : false,
  }),
};
