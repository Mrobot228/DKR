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
var TrackParcelScene_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackParcelScene = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const parcels_service_1 = require("../../modules/parcels/parcels.service");
const main_keyboard_1 = require("../keyboards/main.keyboard");
const inline_keyboard_1 = require("../keyboards/inline.keyboard");
const messages_constant_1 = require("../../constants/messages.constant");
const parcel_status_enum_1 = require("../../constants/parcel-status.enum");
let TrackParcelScene = TrackParcelScene_1 = class TrackParcelScene {
    constructor(parcelsService) {
        this.parcelsService = parcelsService;
        this.logger = new common_1.Logger(TrackParcelScene_1.name);
    }
    async onSceneEnter(ctx) {
        await ctx.reply(messages_constant_1.Messages.TRACK_PROMPT, {
            parse_mode: 'Markdown',
            ...(0, main_keyboard_1.cancelKeyboard)(),
        });
    }
    async onText(ctx) {
        const text = ctx.message.text.trim();
        if (text === '❌ Скасувати') {
            await ctx.reply('Пошук скасовано', (0, main_keyboard_1.mainKeyboard)());
            return ctx.scene.leave();
        }
        const trackingNumber = this.normalizeTrackingNumber(text);
        if (!this.validateTrackingNumber(trackingNumber)) {
            await ctx.reply(messages_constant_1.Messages.ERROR_INVALID_TRACKING, (0, main_keyboard_1.cancelKeyboard)());
            return;
        }
        await ctx.reply('🔄 Шукаю посилку...');
        const parcel = await this.parcelsService.findByTrackingNumber(trackingNumber);
        if (!parcel) {
            await ctx.reply(messages_constant_1.Messages.PARCEL_NOT_FOUND, (0, main_keyboard_1.cancelKeyboard)());
            return;
        }
        const statusLabel = parcel_status_enum_1.ParcelStatusLabels[parcel.currentStatus] || parcel.currentStatus;
        let message = `📦 *Посилка ${parcel.trackingNumber}*\n\n` +
            `📊 *Поточний статус:* ${statusLabel}\n\n` +
            `📤 *Відправник:*\n` +
            `${parcel.senderName}\n` +
            `${parcel.senderCity}\n\n` +
            `📥 *Отримувач:*\n` +
            `${parcel.recipientName}\n` +
            `${parcel.recipientCity}\n\n` +
            `📅 Створено: ${parcel.createdAt.toLocaleDateString('uk-UA')}\n`;
        if (parcel.updatedAt) {
            message += `🔄 Оновлено: ${parcel.updatedAt.toLocaleDateString('uk-UA')}\n`;
        }
        if (parcel.statusHistory && parcel.statusHistory.length > 0) {
            message += `\n📜 *Історія:*\n`;
            message += this.parcelsService.formatStatusHistory(parcel.statusHistory);
        }
        await ctx.reply(message, {
            parse_mode: 'Markdown',
            ...(0, inline_keyboard_1.parcelActionsKeyboard)(parcel.trackingNumber),
        });
        await ctx.scene.leave();
    }
    validateTrackingNumber(number) {
        return /^\d{4}-\d{4}-\d{4}$/.test(number);
    }
    normalizeTrackingNumber(input) {
        const digits = input.replace(/\D/g, '');
        if (digits.length === 12) {
            return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
        }
        return input;
    }
};
exports.TrackParcelScene = TrackParcelScene;
__decorate([
    (0, nestjs_telegraf_1.SceneEnter)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrackParcelScene.prototype, "onSceneEnter", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TrackParcelScene.prototype, "onText", null);
exports.TrackParcelScene = TrackParcelScene = TrackParcelScene_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, nestjs_telegraf_1.Scene)('track-parcel'),
    __metadata("design:paramtypes", [parcels_service_1.ParcelsService])
], TrackParcelScene);
//# sourceMappingURL=track-parcel.scene.js.map