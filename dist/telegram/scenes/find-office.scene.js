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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var FindOfficeScene_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FindOfficeScene = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const telegraf_1 = require("telegraf");
const maps_service_1 = require("../../modules/maps/maps.service");
const main_keyboard_1 = require("../keyboards/main.keyboard");
let FindOfficeScene = FindOfficeScene_1 = class FindOfficeScene {
    constructor(mapsService) {
        this.mapsService = mapsService;
        this.logger = new common_1.Logger(FindOfficeScene_1.name);
    }
    async onSceneEnter(ctx) {
        ctx.session.foundOffices = [];
        await ctx.reply(`🔍 *Пошук поштового відділення*\n\n` +
            `Введіть адресу для пошуку найближчих відділень пошти:\n` +
            `_(Наприклад: Київ, вул. Хрещатик 1)_\n\n` +
            `Або надішліть своє місцезнаходження 📍`, { parse_mode: 'Markdown', ...(0, main_keyboard_1.locationKeyboard)() });
    }
    async onLocation(ctx) {
        const location = ctx.message.location;
        ctx.session.userLat = location.latitude;
        ctx.session.userLng = location.longitude;
        await this.searchAndShowOffices(ctx, location.latitude, location.longitude);
    }
    async onText(ctx) {
        const text = ctx.message.text;
        if (text === '❌ Скасувати') {
            await ctx.reply('Пошук скасовано', (0, main_keyboard_1.mainKeyboard)());
            return ctx.scene.leave();
        }
        await ctx.reply('🔄 Шукаю адресу та найближчі відділення пошти...');
        const result = await this.mapsService.geocodeAddress(text);
        if (!result) {
            await ctx.reply('❌ Не вдалося знайти вказану адресу.\n\n' +
                'Спробуйте ввести адресу детальніше, наприклад:\n' +
                '• Київ, Хрещатик 1\n' +
                '• Львів, проспект Свободи 10\n\n' +
                'Або надішліть своє місцезнаходження 📍', (0, main_keyboard_1.locationKeyboard)());
            return;
        }
        ctx.session.userLat = result.coordinates.lat;
        ctx.session.userLng = result.coordinates.lng;
        await ctx.reply(`📍 Знайдено: _${result.formattedAddress}_`, { parse_mode: 'Markdown' });
        await this.searchAndShowOffices(ctx, result.coordinates.lat, result.coordinates.lng);
    }
    async searchAndShowOffices(ctx, lat, lng) {
        await ctx.reply('🔍 Шукаю поштові відділення поблизу...');
        const offices = await this.mapsService.findNearestPostOffices(lat, lng, 5, 10);
        if (offices.length === 0) {
            await ctx.reply('😔 На жаль, не знайдено поштових відділень в радіусі 5 км.\n\n' +
                'Спробуйте:\n' +
                '• Вказати іншу адресу\n' +
                '• Надіслати своє місцезнаходження', (0, main_keyboard_1.locationKeyboard)());
            return;
        }
        ctx.session.foundOffices = offices;
        let message = `📍 *Знайдено ${offices.length} поштових відділень:*\n\n`;
        for (let i = 0; i < Math.min(offices.length, 5); i++) {
            const office = offices[i];
            const emoji = this.mapsService.getOfficeEmoji(office.type);
            const typeName = this.mapsService.getOfficeTypeName(office.type);
            message += `*${i + 1}. ${emoji} ${office.name}*\n`;
            message += `📍 ${office.address}\n`;
            message += `📏 Відстань: ${this.mapsService.formatDistance(office.distance)}\n`;
            if (office.openingHours) {
                message += `🕐 ${office.openingHours}\n`;
            }
            if (office.phone) {
                message += `📞 ${office.phone}\n`;
            }
            message += `🗺️ [Відкрити на карті](${this.mapsService.getGoogleMapsLink(office.lat, office.lng)})\n\n`;
        }
        const buttons = offices.slice(0, 5).map((office, index) => {
            const emoji = this.mapsService.getOfficeEmoji(office.type);
            return [
                telegraf_1.Markup.button.callback(`${emoji} ${index + 1}. ${office.name.slice(0, 25)}... (${this.mapsService.formatDistance(office.distance)})`, `office_details:${index}`),
            ];
        });
        buttons.push([telegraf_1.Markup.button.callback('🔙 Головне меню', 'main_menu')]);
        await ctx.reply(message, {
            parse_mode: 'Markdown',
            link_preview_options: { is_disabled: true },
            reply_markup: { inline_keyboard: buttons },
        });
    }
    async onOfficeDetails(ctx) {
        const index = parseInt(ctx.callbackQuery.data.split(':')[1], 10);
        const offices = ctx.session.foundOffices || [];
        if (index >= offices.length) {
            await ctx.answerCbQuery('Відділення не знайдено');
            return;
        }
        const office = offices[index];
        const emoji = this.mapsService.getOfficeEmoji(office.type);
        const typeName = this.mapsService.getOfficeTypeName(office.type);
        let message = `${emoji} *${office.name}*\n`;
        message += `_${typeName}_\n\n`;
        message += `📍 *Адреса:* ${office.address}\n`;
        message += `📏 *Відстань:* ${this.mapsService.formatDistance(office.distance)}\n`;
        if (office.openingHours) {
            message += `🕐 *Графік:* ${office.openingHours}\n`;
        }
        if (office.phone) {
            message += `📞 *Телефон:* ${office.phone}\n`;
        }
        message += `\n📍 *Координати:* ${office.lat.toFixed(6)}, ${office.lng.toFixed(6)}`;
        const buttons = [
            [telegraf_1.Markup.button.url('🗺️ Відкрити на карті', this.mapsService.getGoogleMapsLink(office.lat, office.lng))],
        ];
        if (ctx.session.userLat && ctx.session.userLng) {
            buttons.push([
                telegraf_1.Markup.button.url('🚗 Прокласти маршрут', this.mapsService.getDirectionsLink(ctx.session.userLat, ctx.session.userLng, office.lat, office.lng)),
            ]);
        }
        buttons.push([telegraf_1.Markup.button.callback('🔙 До списку', 'back_to_list')]);
        await ctx.answerCbQuery();
        await ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: buttons },
        });
    }
    async onBackToList(ctx) {
        await ctx.answerCbQuery();
        const offices = ctx.session.foundOffices || [];
        if (offices.length === 0) {
            await ctx.reply('Список порожній', (0, main_keyboard_1.mainKeyboard)());
            return ctx.scene.leave();
        }
        let message = `📍 *Знайдено ${offices.length} поштових відділень:*\n\n`;
        for (let i = 0; i < Math.min(offices.length, 5); i++) {
            const office = offices[i];
            const emoji = this.mapsService.getOfficeEmoji(office.type);
            message += `*${i + 1}. ${emoji} ${office.name}*\n`;
            message += `📍 ${office.address}\n`;
            message += `📏 ${this.mapsService.formatDistance(office.distance)}\n\n`;
        }
        const buttons = offices.slice(0, 5).map((office, index) => {
            const emoji = this.mapsService.getOfficeEmoji(office.type);
            return [
                telegraf_1.Markup.button.callback(`${emoji} ${index + 1}. ${office.name.slice(0, 25)}...`, `office_details:${index}`),
            ];
        });
        buttons.push([telegraf_1.Markup.button.callback('🔙 Головне меню', 'main_menu')]);
        await ctx.editMessageText(message, {
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: buttons },
        });
    }
    async onMainMenu(ctx) {
        await ctx.answerCbQuery();
        await ctx.reply('Головне меню', (0, main_keyboard_1.mainKeyboard)());
        await ctx.scene.leave();
    }
};
exports.FindOfficeScene = FindOfficeScene;
__decorate([
    (0, nestjs_telegraf_1.SceneEnter)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FindOfficeScene.prototype, "onSceneEnter", null);
__decorate([
    (0, nestjs_telegraf_1.On)('location'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FindOfficeScene.prototype, "onLocation", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FindOfficeScene.prototype, "onText", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/office_details:(\d+)/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FindOfficeScene.prototype, "onOfficeDetails", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('back_to_list'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FindOfficeScene.prototype, "onBackToList", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('main_menu'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FindOfficeScene.prototype, "onMainMenu", null);
exports.FindOfficeScene = FindOfficeScene = FindOfficeScene_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, nestjs_telegraf_1.Scene)('find-office'),
    __metadata("design:paramtypes", [maps_service_1.MapsService])
], FindOfficeScene);
//# sourceMappingURL=find-office.scene.js.map