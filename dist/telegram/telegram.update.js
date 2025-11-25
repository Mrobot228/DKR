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
var TelegramUpdate_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramUpdate = void 0;
const common_1 = require("@nestjs/common");
const nestjs_telegraf_1 = require("nestjs-telegraf");
const users_service_1 = require("../modules/users/users.service");
const parcels_service_1 = require("../modules/parcels/parcels.service");
const post_offices_service_1 = require("../modules/post-offices/post-offices.service");
const main_keyboard_1 = require("./keyboards/main.keyboard");
const inline_keyboard_1 = require("./keyboards/inline.keyboard");
const messages_constant_1 = require("../constants/messages.constant");
const parcel_status_enum_1 = require("../constants/parcel-status.enum");
const config_1 = require("@nestjs/config");
let TelegramUpdate = TelegramUpdate_1 = class TelegramUpdate {
    constructor(usersService, parcelsService, postOfficesService, configService) {
        this.usersService = usersService;
        this.parcelsService = parcelsService;
        this.postOfficesService = postOfficesService;
        this.configService = configService;
        this.logger = new common_1.Logger(TelegramUpdate_1.name);
        this.adminIds = this.configService
            .get('ADMIN_IDS', '')
            .split(',')
            .filter((id) => id.trim())
            .map((id) => parseInt(id.trim(), 10));
    }
    async onStart(ctx) {
        const user = ctx.from;
        if (!user)
            return;
        await this.usersService.createOrUpdate({
            telegramId: user.id,
            username: user.username,
            firstName: user.first_name,
            lastName: user.last_name,
        });
        this.logger.log(`Користувач ${user.id} (@${user.username}) запустив бота`);
        await ctx.reply(messages_constant_1.Messages.WELCOME, { parse_mode: 'Markdown', ...(0, main_keyboard_1.mainKeyboard)() });
    }
    async onHelp(ctx) {
        await ctx.reply(messages_constant_1.Messages.HELP, { parse_mode: 'Markdown' });
    }
    async onFindCommand(ctx) {
        await ctx.scene.enter('find-office');
    }
    async onCreateCommand(ctx) {
        await ctx.scene.enter('create-parcel');
    }
    async onTrackCommand(ctx) {
        await ctx.scene.enter('track-parcel');
    }
    async onMyParcelsCommand(ctx) {
        await this.showUserParcels(ctx);
    }
    async onCalcCommand(ctx) {
        await ctx.scene.enter('calculator');
    }
    async onAdminCommand(ctx) {
        if (!this.isAdmin(ctx.from?.id)) {
            await ctx.reply('❌ У вас немає доступу до адміністративної панелі.');
            return;
        }
        await ctx.reply('🔧 *Адміністративна панель*', {
            parse_mode: 'Markdown',
            ...(0, inline_keyboard_1.adminMenuKeyboard)(),
        });
    }
    async onText(ctx) {
        const text = ctx.message.text;
        switch (text) {
            case '🔍 Знайти відділення':
                await ctx.scene.enter('find-office');
                break;
            case '📦 Створити накладну':
                await ctx.scene.enter('create-parcel');
                break;
            case '📍 Відстежити посилку':
                await ctx.scene.enter('track-parcel');
                break;
            case '📋 Мої посилки':
                await this.showUserParcels(ctx);
                break;
            case '💰 Калькулятор':
                await ctx.scene.enter('calculator');
                break;
            case 'ℹ️ Інформація':
                await ctx.reply(messages_constant_1.Messages.INFO, { parse_mode: 'Markdown' });
                break;
            case '🔙 Головне меню':
                await ctx.reply('Головне меню', (0, main_keyboard_1.mainKeyboard)());
                break;
            default:
                if (this.looksLikeTrackingNumber(text)) {
                    await this.trackParcelDirect(ctx, text);
                }
                break;
        }
    }
    async onMyParcelsAction(ctx) {
        await ctx.answerCbQuery();
        await this.showUserParcels(ctx);
    }
    async onParcelsPage(ctx) {
        const page = parseInt(ctx.callbackQuery.data.split(':')[1], 10);
        await ctx.answerCbQuery();
        await this.showUserParcels(ctx, page);
    }
    async onParcelDetails(ctx) {
        const trackingNumber = ctx.callbackQuery.data.split(':')[1];
        await ctx.answerCbQuery();
        const parcel = await this.parcelsService.findByTrackingNumber(trackingNumber);
        if (!parcel) {
            await ctx.reply(messages_constant_1.Messages.PARCEL_NOT_FOUND);
            return;
        }
        const message = this.parcelsService.formatParcelInfo(parcel);
        await ctx.reply(message, {
            parse_mode: 'Markdown',
            ...(0, inline_keyboard_1.parcelActionsKeyboard)(trackingNumber),
        });
    }
    async onTrackAction(ctx) {
        const trackingNumber = ctx.callbackQuery.data.split(':')[1];
        await ctx.answerCbQuery();
        const parcel = await this.parcelsService.findByTrackingNumber(trackingNumber);
        if (!parcel) {
            await ctx.reply(messages_constant_1.Messages.PARCEL_NOT_FOUND);
            return;
        }
        const statusLabel = parcel_status_enum_1.ParcelStatusLabels[parcel.currentStatus];
        let message = `📦 *${parcel.trackingNumber}*\n\n📊 *Статус:* ${statusLabel}\n\n`;
        if (parcel.statusHistory && parcel.statusHistory.length > 0) {
            message += `📜 *Історія:*\n`;
            message += this.parcelsService.formatStatusHistory(parcel.statusHistory);
        }
        await ctx.reply(message, { parse_mode: 'Markdown' });
    }
    async onDetailsAction(ctx) {
        const trackingNumber = ctx.callbackQuery.data.split(':')[1];
        await ctx.answerCbQuery();
        const parcel = await this.parcelsService.findByTrackingNumber(trackingNumber);
        if (!parcel) {
            await ctx.reply(messages_constant_1.Messages.PARCEL_NOT_FOUND);
            return;
        }
        const message = this.parcelsService.formatParcelInfo(parcel);
        await ctx.reply(message, { parse_mode: 'Markdown' });
    }
    async onMainMenu(ctx) {
        await ctx.answerCbQuery();
        await ctx.reply('Головне меню', (0, main_keyboard_1.mainKeyboard)());
    }
    async onAdminStats(ctx) {
        if (!this.isAdmin(ctx.from?.id)) {
            await ctx.answerCbQuery('Немає доступу');
            return;
        }
        await ctx.answerCbQuery();
        const stats = await this.parcelsService.getStatistics();
        const usersCount = await this.usersService.getTotalCount();
        const officesCount = await this.postOfficesService.getTotalCount();
        let message = `📊 *Статистика*\n\n`;
        message += `👥 Користувачів: ${usersCount}\n`;
        message += `📦 Посилок: ${stats.total}\n`;
        message += `🏢 Відділень: ${officesCount}\n\n`;
        message += `*Посилки за статусами:*\n`;
        for (const [status, count] of Object.entries(stats.byStatus)) {
            const label = parcel_status_enum_1.ParcelStatusLabels[status] || status;
            message += `${label}: ${count}\n`;
        }
        await ctx.reply(message, { parse_mode: 'Markdown', ...(0, inline_keyboard_1.adminMenuKeyboard)() });
    }
    async onAdminFindParcel(ctx) {
        if (!this.isAdmin(ctx.from?.id)) {
            await ctx.answerCbQuery('Немає доступу');
            return;
        }
        await ctx.answerCbQuery();
        await ctx.reply('Введіть номер посилки для пошуку:');
    }
    async onAdminMenu(ctx) {
        if (!this.isAdmin(ctx.from?.id)) {
            await ctx.answerCbQuery('Немає доступу');
            return;
        }
        await ctx.answerCbQuery();
        await ctx.reply('🔧 *Адміністративна панель*', {
            parse_mode: 'Markdown',
            ...(0, inline_keyboard_1.adminMenuKeyboard)(),
        });
    }
    async onAdminChangeStatus(ctx) {
        if (!this.isAdmin(ctx.from?.id)) {
            await ctx.answerCbQuery('Немає доступу');
            return;
        }
        const trackingNumber = ctx.callbackQuery.data.split(':')[1];
        await ctx.answerCbQuery();
        const buttons = Object.entries(parcel_status_enum_1.ParcelStatusLabels).map(([status, label]) => [
            { text: label, callback_data: `set_status:${trackingNumber}:${status}` },
        ]);
        buttons.push([{ text: '🔙 Назад', callback_data: `parcel:${trackingNumber}` }]);
        await ctx.reply('Оберіть новий статус:', {
            reply_markup: { inline_keyboard: buttons },
        });
    }
    async onSetStatus(ctx) {
        if (!this.isAdmin(ctx.from?.id)) {
            await ctx.answerCbQuery('Немає доступу');
            return;
        }
        const parts = ctx.callbackQuery.data.split(':');
        const trackingNumber = parts[1];
        const newStatus = parts[2];
        await ctx.answerCbQuery();
        try {
            await this.parcelsService.updateStatus({
                trackingNumber,
                status: newStatus,
                comment: `Статус змінено адміністратором`,
            });
            const statusLabel = parcel_status_enum_1.ParcelStatusLabels[newStatus];
            await ctx.reply(`✅ Статус посилки ${trackingNumber} змінено на: ${statusLabel}`);
            const parcel = await this.parcelsService.findByTrackingNumber(trackingNumber);
            if (parcel) {
                try {
                    await ctx.telegram.sendMessage(parcel.senderTelegramId, `📦 Статус вашої посилки ${trackingNumber} змінено:\n${statusLabel}`);
                }
                catch (e) {
                    this.logger.warn('Не вдалося сповістити відправника');
                }
            }
        }
        catch (error) {
            await ctx.reply('❌ Помилка при зміні статусу');
        }
    }
    async onIgnore(ctx) {
        await ctx.answerCbQuery();
    }
    async showUserParcels(ctx, page = 0) {
        const userId = ctx.from?.id;
        if (!userId)
            return;
        const parcels = await this.parcelsService.findByUser(userId);
        if (parcels.length === 0) {
            await ctx.reply(messages_constant_1.Messages.NO_PARCELS, (0, main_keyboard_1.mainKeyboard)());
            return;
        }
        await ctx.reply(messages_constant_1.Messages.MY_PARCELS_HEADER, {
            parse_mode: 'Markdown',
            ...(0, inline_keyboard_1.parcelsListKeyboard)(parcels, page),
        });
    }
    async trackParcelDirect(ctx, input) {
        const digits = input.replace(/\D/g, '');
        if (digits.length !== 12)
            return;
        const trackingNumber = `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
        const parcel = await this.parcelsService.findByTrackingNumber(trackingNumber);
        if (parcel) {
            const statusLabel = parcel_status_enum_1.ParcelStatusLabels[parcel.currentStatus];
            await ctx.reply(`📦 Знайдено посилку!\n\n*${trackingNumber}*\nСтатус: ${statusLabel}`, { parse_mode: 'Markdown', ...(0, inline_keyboard_1.parcelActionsKeyboard)(trackingNumber) });
        }
    }
    looksLikeTrackingNumber(text) {
        const digits = text.replace(/\D/g, '');
        return digits.length === 12;
    }
    isAdmin(userId) {
        if (!userId)
            return false;
        return this.adminIds.includes(userId);
    }
};
exports.TelegramUpdate = TelegramUpdate;
__decorate([
    (0, nestjs_telegraf_1.Start)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onStart", null);
__decorate([
    (0, nestjs_telegraf_1.Help)(),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onHelp", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('find'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onFindCommand", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('create'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onCreateCommand", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('track'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onTrackCommand", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('my'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onMyParcelsCommand", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('calc'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onCalcCommand", null);
__decorate([
    (0, nestjs_telegraf_1.Command)('admin'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onAdminCommand", null);
__decorate([
    (0, nestjs_telegraf_1.On)('text'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onText", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('my_parcels'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onMyParcelsAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/parcels_page:(\d+)/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onParcelsPage", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/parcel:(.+)/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onParcelDetails", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/track:(.+)/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onTrackAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/details:(.+)/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onDetailsAction", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('main_menu'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onMainMenu", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('admin_stats'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onAdminStats", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('admin_find_parcel'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onAdminFindParcel", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('admin_menu'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onAdminMenu", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/admin_change_status:(.+)/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onAdminChangeStatus", null);
__decorate([
    (0, nestjs_telegraf_1.Action)(/set_status:(.+):(.+)/),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onSetStatus", null);
__decorate([
    (0, nestjs_telegraf_1.Action)('ignore'),
    __param(0, (0, nestjs_telegraf_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TelegramUpdate.prototype, "onIgnore", null);
exports.TelegramUpdate = TelegramUpdate = TelegramUpdate_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, nestjs_telegraf_1.Update)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        parcels_service_1.ParcelsService,
        post_offices_service_1.PostOfficesService,
        config_1.ConfigService])
], TelegramUpdate);
//# sourceMappingURL=telegram.update.js.map