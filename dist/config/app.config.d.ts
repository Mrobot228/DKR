import { ConfigService } from '@nestjs/config';
export interface AppConfig {
    port: number;
    nodeEnv: string;
    adminIds: number[];
    googleMapsApiKey: string;
}
export declare const getAppConfig: (configService: ConfigService) => AppConfig;
export declare const DeliveryRates: {
    standard: {
        basePrice: number;
        pricePerKg: number;
        minDays: number;
        maxDays: number;
    };
    express: {
        basePrice: number;
        pricePerKg: number;
        minDays: number;
        maxDays: number;
    };
};
export declare const CityDistances: Record<string, Record<string, number>>;
export declare const DistanceRatePer100Km = 5;
