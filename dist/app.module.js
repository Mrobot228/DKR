"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AppModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const database_config_1 = require("./config/database.config");
const telegram_module_1 = require("./telegram/telegram.module");
const users_module_1 = require("./modules/users/users.module");
const post_offices_module_1 = require("./modules/post-offices/post-offices.module");
const parcels_module_1 = require("./modules/parcels/parcels.module");
const maps_module_1 = require("./modules/maps/maps.module");
const find_office_scene_1 = require("./telegram/scenes/find-office.scene");
const create_parcel_scene_1 = require("./telegram/scenes/create-parcel.scene");
const track_parcel_scene_1 = require("./telegram/scenes/track-parcel.scene");
const calculator_scene_1 = require("./telegram/scenes/calculator.scene");
const post_offices_service_1 = require("./modules/post-offices/post-offices.service");
let AppModule = AppModule_1 = class AppModule {
    constructor(postOfficesService) {
        this.postOfficesService = postOfficesService;
        this.logger = new common_1.Logger(AppModule_1.name);
    }
    async onModuleInit() {
        try {
            await this.postOfficesService.seedTestData();
            this.logger.log('Модуль AppModule ініціалізовано');
        }
        catch (error) {
            this.logger.error('Помилка ініціалізації:', error);
        }
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = AppModule_1 = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync(database_config_1.databaseConfig),
            nestjs_telegraf_1.TelegrafModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const token = configService.get('BOT_TOKEN');
                    if (!token) {
                        throw new Error('BOT_TOKEN is not defined! Please set it in .env file.');
                    }
                    return {
                        token,
                        middlewares: [(0, telegraf_1.session)()],
                        include: [telegram_module_1.TelegramModule],
                    };
                },
            }),
            telegram_module_1.TelegramModule,
            users_module_1.UsersModule,
            post_offices_module_1.PostOfficesModule,
            parcels_module_1.ParcelsModule,
            maps_module_1.MapsModule,
        ],
        providers: [
            find_office_scene_1.FindOfficeScene,
            create_parcel_scene_1.CreateParcelScene,
            track_parcel_scene_1.TrackParcelScene,
            calculator_scene_1.CalculatorScene,
        ],
    }),
    __metadata("design:paramtypes", [post_offices_service_1.PostOfficesService])
], AppModule);
//# sourceMappingURL=app.module.js.map