"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramModule = void 0;
const common_1 = require("@nestjs/common");
const telegram_update_1 = require("./telegram.update");
const users_module_1 = require("../modules/users/users.module");
const parcels_module_1 = require("../modules/parcels/parcels.module");
const post_offices_module_1 = require("../modules/post-offices/post-offices.module");
const maps_module_1 = require("../modules/maps/maps.module");
const find_office_scene_1 = require("./scenes/find-office.scene");
const create_parcel_scene_1 = require("./scenes/create-parcel.scene");
const track_parcel_scene_1 = require("./scenes/track-parcel.scene");
const calculator_scene_1 = require("./scenes/calculator.scene");
let TelegramModule = class TelegramModule {
};
exports.TelegramModule = TelegramModule;
exports.TelegramModule = TelegramModule = __decorate([
    (0, common_1.Module)({
        imports: [users_module_1.UsersModule, parcels_module_1.ParcelsModule, post_offices_module_1.PostOfficesModule, maps_module_1.MapsModule],
        providers: [
            telegram_update_1.TelegramUpdate,
            find_office_scene_1.FindOfficeScene,
            create_parcel_scene_1.CreateParcelScene,
            track_parcel_scene_1.TrackParcelScene,
            calculator_scene_1.CalculatorScene,
        ],
        exports: [
            telegram_update_1.TelegramUpdate,
            find_office_scene_1.FindOfficeScene,
            create_parcel_scene_1.CreateParcelScene,
            track_parcel_scene_1.TrackParcelScene,
            calculator_scene_1.CalculatorScene,
        ],
    })
], TelegramModule);
//# sourceMappingURL=telegram.module.js.map