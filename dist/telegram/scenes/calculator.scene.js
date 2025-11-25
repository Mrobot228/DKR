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
var CalculatorScene_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalculatorScene = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const parcels_service_1 = require("../../modules/parcels/parcels.service");
const main_keyboard_1 = require("../keyboards/main.keyboard");
let CalculatorScene = CalculatorScene_1 = class CalculatorScene {
    constructor(parcelsService) {
        this.parcelsService = parcelsService;
        this.logger = new common_1.Logger(CalculatorScene_1.name);
    }
    async onSceneEnter(ctx) {
        ctx.session.calcData = {};
        ctx.session.step = 'FROM_CITY';
        await ctx.reply('💰 *Калькулятор вартості доставки*\n\nВведіть місто відправлення:', { parse_mode: 'Markdown', ...(0, main_keyboard_1.cancelKeyboard)() });
    }
    async onText(ctx) {
        const text = ctx.message.text.trim();
        if (text === '❌ Скасувати') {
            await ctx.reply('Розрахунок скасовано', (0, main_keyboard_1.mainKeyboard)());
            return ctx.scene.leave();
        }
        const { step, calcData } = ctx.session;
        switch (step) {
            case 'FROM_CITY':
                calcData.fromCity = text;
                ctx.session.step = 'TO_CITY';
                await ctx.reply('Введіть місто отримання:', (0, main_keyboard_1.cancelKeyboard)());
                break;
            case 'TO_CITY':
                calcData.toCity = text;
                ctx.session.step = 'WEIGHT';
                await ctx.reply('Введіть вагу посилки (кг):\n_(наприклад: 2.5)_', { parse_mode: 'Markdown', ...(0, main_keyboard_1.cancelKeyboard)() });
                break;
            case 'WEIGHT':
                const weight = parseFloat(text.replace(',', '.'));
                if (isNaN(weight) || weight <= 0 || weight > 1000) {
                    await ctx.reply('❌ Невірний формат ваги. Введіть число від 0.01 до 1000:', (0, main_keyboard_1.cancelKeyboard)());
                    return;
                }
                calcData.weight = weight;
                await this.showResults(ctx);
                break;
        }
    }
    async showResults(ctx) {
        const { fromCity, toCity, weight } = ctx.session.calcData;
        const standardCost = this.parcelsService.calculateDeliveryCost(fromCity, toCity, weight, 'standard');
        const expressCost = this.parcelsService.calculateDeliveryCost(fromCity, toCity, weight, 'express');
        const standardTime = this.parcelsService.getDeliveryTime('standard');
        const expressTime = this.parcelsService.getDeliveryTime('express');
        const message = `💰 *Розрахунок вартості доставки*\n\n` +
            `📍 *Маршрут:* ${fromCity} → ${toCity}\n` +
            `📦 *Вага:* ${weight} кг\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `📦 *Стандартна доставка*\n` +
            `   💵 Вартість: *${standardCost} грн*\n` +
            `   📅 Термін: ${standardTime.min}-${standardTime.max} робочих днів\n\n` +
            `⚡ *Експрес доставка*\n` +
            `   💵 Вартість: *${expressCost} грн*\n` +
            `   📅 Термін: ${expressTime.min}-${expressTime.max} робочих дні\n\n` +
            `━━━━━━━━━━━━━━━━━━━━━\n\n` +
            `_* Остаточна вартість може відрізнятися залежно від оголошеної цінності посилки_`;
        await ctx.reply(message, { parse_mode: 'Markdown', ...(0, main_keyboard_1.mainKeyboard)() });
        await ctx.scene.leave();
    }
};
exports.CalculatorScene = CalculatorScene;
__decorate([
    (0, nestjs_telegraf_1.SceneEnter)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalculatorScene.prototype, "onSceneEnter", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CalculatorScene.prototype, "onText", null);
exports.CalculatorScene = CalculatorScene = CalculatorScene_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, nestjs_telegraf_1.Scene)('calculator'),
    __metadata("design:paramtypes", [parcels_service_1.ParcelsService])
], CalculatorScene);
//# sourceMappingURL=calculator.scene.js.map