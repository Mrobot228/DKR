import { ConfigService } from '@nestjs/config';

export interface AppConfig {
  port: number;
  nodeEnv: string;
  adminIds: number[];
  googleMapsApiKey: string;
}

export const getAppConfig = (configService: ConfigService): AppConfig => ({
  port: configService.get<number>('PORT', 3000),
  nodeEnv: configService.get<string>('NODE_ENV', 'development'),
  adminIds: configService
    .get<string>('ADMIN_IDS', '')
    .split(',')
    .filter((id) => id.trim())
    .map((id) => parseInt(id.trim(), 10)),
  googleMapsApiKey: configService.get<string>('GOOGLE_MAPS_API_KEY', ''),
});

/**
 * Тарифи доставки
 */
export const DeliveryRates = {
  standard: {
    basePrice: 45, // Базова ціна в грн
    pricePerKg: 10, // Ціна за кг
    minDays: 3,
    maxDays: 5,
  },
  express: {
    basePrice: 85,
    pricePerKg: 20,
    minDays: 1,
    maxDays: 2,
  },
};

/**
 * Відстані між основними містами України (км)
 */
export const CityDistances: Record<string, Record<string, number>> = {
  київ: {
    одеса: 475,
    харків: 480,
    львів: 540,
    дніпро: 480,
    запоріжжя: 560,
    вінниця: 260,
    полтава: 340,
    чернігів: 140,
  },
  одеса: {
    київ: 475,
    харків: 700,
    львів: 800,
    дніпро: 500,
    миколаїв: 130,
  },
  харків: {
    київ: 480,
    одеса: 700,
    львів: 1000,
    дніпро: 220,
    полтава: 140,
  },
  львів: {
    київ: 540,
    одеса: 800,
    харків: 1000,
    івано_франківськ: 130,
    тернопіль: 130,
  },
  дніпро: {
    київ: 480,
    харків: 220,
    одеса: 500,
    запоріжжя: 85,
  },
};

/**
 * Коефіцієнт вартості за відстань
 */
export const DistanceRatePer100Km = 5; // грн за 100 км




