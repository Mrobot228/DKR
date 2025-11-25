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
var CreateParcelScene_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateParcelScene = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const parcels_service_1 = require("../../modules/parcels/parcels.service");
const users_service_1 = require("../../modules/users/users.service");
const post_offices_service_1 = require("../../modules/post-offices/post-offices.service");
const main_keyboard_1 = require("../keyboards/main.keyboard");
const inline_keyboard_1 = require("../keyboards/inline.keyboard");
const messages_constant_1 = require("../../constants/messages.constant");
let CreateParcelScene = CreateParcelScene_1 = class CreateParcelScene {
    constructor(parcelsService, usersService, postOfficesService) {
        this.parcelsService = parcelsService;
        this.usersService = usersService;
        this.postOfficesService = postOfficesService;
        this.logger = new common_1.Logger(CreateParcelScene_1.name);
    }
    async onSceneEnter(ctx) {
        ctx.session.parcelData = {};
        ctx.session.step = 'SENDER_NAME';
        const step = messages_constant_1.CreateParcelSteps.SENDER_NAME;
        await ctx.reply(`📦 *Створення накладної*\n\n*Крок ${step.step} з ${step.total}:* ${step.message}`, { parse_mode: 'Markdown', ...(0, main_keyboard_1.cancelKeyboard)() });
    }
    async onText(ctx) {
        const text = ctx.message.text;
        if (text === '❌ Скасувати') {
            await ctx.reply(messages_constant_1.Messages.CREATE_PARCEL_CANCELLED, (0, main_keyboard_1.mainKeyboard)());
            return ctx.scene.leave();
        }
        const { step, parcelData } = ctx.session;
        switch (step) {
            case 'SENDER_NAME':
                parcelData.senderName = text;
                await this.nextStep(ctx, 'SENDER_PHONE');
                break;
            case 'SENDER_PHONE':
                if (!this.validatePhone(text)) {
                    await ctx.reply(messages_constant_1.Messages.ERROR_INVALID_PHONE, (0, main_keyboard_1.cancelKeyboard)());
                    return;
                }
                parcelData.senderPhone = this.normalizePhone(text);
                await this.nextStep(ctx, 'SENDER_CITY');
                break;
            case 'SENDER_CITY':
                parcelData.senderCity = text;
                await this.nextStep(ctx, 'SENDER_ADDRESS');
                break;
            case 'SENDER_ADDRESS':
                parcelData.senderAddress = text;
                await this.nextStep(ctx, 'SENDER_OFFICE');
                break;
            case 'SENDER_OFFICE':
                parcelData.senderOfficeNumber = text;
                const senderOffice = await this.postOfficesService.findByNumber(text);
                if (senderOffice) {
                    parcelData.senderOfficeId = senderOffice.id;
                }
                await this.nextStep(ctx, 'RECIPIENT_NAME');
                break;
            case 'RECIPIENT_NAME':
                parcelData.recipientName = text;
                await this.nextStep(ctx, 'RECIPIENT_PHONE');
                break;
            case 'RECIPIENT_PHONE':
                if (!this.validatePhone(text)) {
                    await ctx.reply(messages_constant_1.Messages.ERROR_INVALID_PHONE, (0, main_keyboard_1.cancelKeyboard)());
                    return;
                }
                parcelData.recipientPhone = this.normalizePhone(text);
                await this.nextStep(ctx, 'RECIPIENT_CITY');
                break;
            case 'RECIPIENT_CITY':
                parcelData.recipientCity = text;
                await this.nextStep(ctx, 'RECIPIENT_ADDRESS');
                break;
            case 'RECIPIENT_ADDRESS':
                parcelData.recipientAddress = text;
                await this.nextStep(ctx, 'RECIPIENT_OFFICE');
                break;
            case 'RECIPIENT_OFFICE':
                parcelData.recipientOfficeNumber = text;
                const recipientOffice = await this.postOfficesService.findByNumber(text);
                if (recipientOffice) {
                    parcelData.recipientOfficeId = recipientOffice.id;
                }
                await this.nextStep(ctx, 'DESCRIPTION');
                break;
            case 'DESCRIPTION':
                parcelData.description = text;
                await this.nextStep(ctx, 'WEIGHT');
                break;
            case 'WEIGHT':
                const weight = parseFloat(text.replace(',', '.'));
                if (isNaN(weight) || weight <= 0 || weight > 1000) {
                    await ctx.reply(messages_constant_1.Messages.ERROR_INVALID_WEIGHT, (0, main_keyboard_1.cancelKeyboard)());
                    return;
                }
                parcelData.weight = weight;
                await this.nextStep(ctx, 'DECLARED_VALUE');
                break;
            case 'DECLARED_VALUE':
                const value = parseFloat(text.replace(',', '.'));
                if (isNaN(value) || value < 0) {
                    await ctx.reply(messages_constant_1.Messages.ERROR_INVALID_VALUE, (0, main_keyboard_1.cancelKeyboard)());
                    return;
                }
                parcelData.declaredValue = value;
                await this.askDeliveryType(ctx);
                break;
        }
    }
    async onDeliveryStandard(ctx) {
        await ctx.answerCbQuery();
        ctx.session.parcelData.deliveryType = 'standard';
        await this.showConfirmation(ctx);
    }
    async onDeliveryExpress(ctx) {
        await ctx.answerCbQuery();
        ctx.session.parcelData.deliveryType = 'express';
        await this.showConfirmation(ctx);
    }
    async onConfirmParcel(ctx) {
        await ctx.answerCbQuery();
        await this.createParcel(ctx);
    }
    async onCancelParcel(ctx) {
        await ctx.answerCbQuery();
        await ctx.reply(messages_constant_1.Messages.CREATE_PARCEL_CANCELLED, (0, main_keyboard_1.mainKeyboard)());
        await ctx.scene.leave();
    }
    async nextStep(ctx, nextStepKey) {
        ctx.session.step = nextStepKey;
        const stepInfo = messages_constant_1.CreateParcelSteps[nextStepKey];
        await ctx.reply(`*Крок ${stepInfo.step} з ${stepInfo.total}:* ${stepInfo.message}`, { parse_mode: 'Markdown', ...(0, main_keyboard_1.cancelKeyboard)() });
    }
    async askDeliveryType(ctx) {
        ctx.session.step = 'DELIVERY_TYPE';
        const { senderCity, recipientCity, weight } = ctx.session.parcelData;
        const standardCost = this.parcelsService.calculateDeliveryCost(senderCity, recipientCity, weight, 'standard');
        const expressCost = this.parcelsService.calculateDeliveryCost(senderCity, recipientCity, weight, 'express');
        const standardTime = this.parcelsService.getDeliveryTime('standard');
        const expressTime = this.parcelsService.getDeliveryTime('express');
        await ctx.reply(`*Оберіть тип доставки:*\n\n` +
            `📦 *Стандартна доставка*\n` +
            `   Термін: ${standardTime.min}-${standardTime.max} днів\n` +
            `   Вартість: ~${standardCost} грн\n\n` +
            `⚡ *Експрес доставка*\n` +
            `   Термін: ${expressTime.min}-${expressTime.max} дні\n` +
            `   Вартість: ~${expressCost} грн`, { parse_mode: 'Markdown', ...(0, inline_keyboard_1.deliveryTypeInlineKeyboard)() });
    }
    async showConfirmation(ctx) {
        const data = ctx.session.parcelData;
        const deliveryCost = this.parcelsService.calculateDeliveryCost(data.senderCity, data.recipientCity, data.weight, data.deliveryType);
        const message = `📋 *Перевірте дані накладної:*\n\n` +
            `📤 *ВІДПРАВНИК:*\n` +
            `ПІБ: ${data.senderName}\n` +
            `Телефон: ${data.senderPhone}\n` +
            `Місто: ${data.senderCity}\n` +
            `Адреса: ${data.senderAddress}\n` +
            `Відділення: №${data.senderOfficeNumber}\n\n` +
            `📥 *ОТРИМУВАЧ:*\n` +
            `ПІБ: ${data.recipientName}\n` +
            `Телефон: ${data.recipientPhone}\n` +
            `Місто: ${data.recipientCity}\n` +
            `Адреса: ${data.recipientAddress}\n` +
            `Відділення: №${data.recipientOfficeNumber}\n\n` +
            `📦 *ПОСИЛКА:*\n` +
            `Опис: ${data.description}\n` +
            `Вага: ${data.weight} кг\n` +
            `Оголошена вартість: ${data.declaredValue} грн\n` +
            `Тип доставки: ${data.deliveryType === 'express' ? '⚡ Експрес' : '📦 Стандартна'}\n` +
            `💰 *Вартість доставки: ${deliveryCost} грн*\n\n` +
            `Підтвердити створення накладної?`;
        await ctx.reply(message, {
            parse_mode: 'Markdown',
            ...(0, inline_keyboard_1.confirmInlineKeyboard)('confirm_parcel', 'cancel_parcel'),
        });
    }
    async createParcel(ctx) {
        try {
            const data = ctx.session.parcelData;
            data.senderTelegramId = ctx.from.id;
            const { senderOfficeNumber, recipientOfficeNumber, ...parcelData } = data;
            const parcel = await this.parcelsService.create(parcelData);
            await ctx.reply(messages_constant_1.Messages.PARCEL_CREATED(parcel.trackingNumber), { parse_mode: 'Markdown', ...(0, main_keyboard_1.mainKeyboard)() });
            await this.notifyRecipient(ctx, parcel.trackingNumber, data);
            await ctx.scene.leave();
        }
        catch (error) {
            this.logger.error('Помилка створення посилки:', error);
            await ctx.reply('❌ Помилка при створенні накладної.\n\nСпробуйте ще раз пізніше.', (0, main_keyboard_1.mainKeyboard)());
            await ctx.scene.leave();
        }
    }
    async notifyRecipient(ctx, trackingNumber, data) {
        try {
            const recipient = await this.usersService.findByPhone(data.recipientPhone);
            if (recipient && recipient.telegramId !== ctx.from.id) {
                await ctx.telegram.sendMessage(recipient.telegramId, `📬 *Для вас створено посилку!*\n\n` +
                    `Відправник: ${data.senderName}\n` +
                    `Місто відправлення: ${data.senderCity}\n\n` +
                    `📋 Номер відстеження:\n\`${trackingNumber}\`\n\n` +
                    `Ви можете відстежити посилку за цим номером.`, { parse_mode: 'Markdown' });
            }
        }
        catch (error) {
            this.logger.warn('Не вдалося сповістити отримувача:', error);
        }
    }
    validatePhone(phone) {
        const normalized = phone.replace(/[\s\-\(\)]/g, '');
        return /^(\+?380|0)\d{9}$/.test(normalized);
    }
    normalizePhone(phone) {
        let normalized = phone.replace(/[\s\-\(\)]/g, '');
        if (normalized.startsWith('0')) {
            normalized = '+38' + normalized;
        }
        else if (!normalized.startsWith('+')) {
            normalized = '+' + normalized;
        }
        return normalized;
    }
};
exports.CreateParcelScene = CreateParcelScene;
__decorate([
    (0, nestjs_telegraf_1.SceneEnter)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreateParcelScene.prototype, "onSceneEnter", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreateParcelScene.prototype, "onText", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('delivery_standard'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreateParcelScene.prototype, "onDeliveryStandard", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('delivery_express'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreateParcelScene.prototype, "onDeliveryExpress", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('confirm_parcel'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreateParcelScene.prototype, "onConfirmParcel", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('cancel_parcel'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CreateParcelScene.prototype, "onCancelParcel", null);
exports.CreateParcelScene = CreateParcelScene = CreateParcelScene_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, nestjs_telegraf_1.Scene)('create-parcel'),
    __metadata("design:paramtypes", [parcels_service_1.ParcelsService,
        users_service_1.UsersService,
        post_offices_service_1.PostOfficesService])
], CreateParcelScene);
//# sourceMappingURL=create-parcel.scene.js.map