"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistanceRatePer100Km = exports.CityDistances = exports.DeliveryRates = exports.getAppConfig = void 0;
const getAppConfig = (configService) => ({
    port: configService.get('PORT', 3000),
    nodeEnv: configService.get('NODE_ENV', 'development'),
    adminIds: configService
        .get('ADMIN_IDS', '')
        .split(',')
        .filter((id) => id.trim())
        .map((id) => parseInt(id.trim(), 10)),
    googleMapsApiKey: configService.get('GOOGLE_MAPS_API_KEY', ''),
});
exports.getAppConfig = getAppConfig;
exports.DeliveryRates = {
    standard: {
        basePrice: 45,
        pricePerKg: 10,
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
exports.CityDistances = {
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
exports.DistanceRatePer100Km = 5;
//# sourceMappingURL=app.config.js.map