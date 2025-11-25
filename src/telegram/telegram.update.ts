import { Injectable, Logger } from '@nestjs/common';
import { Update, Ctx, Start, Help, Command, On, Action } from 'nestjs-telegraf';
import { Context, Scenes } from 'telegraf';
import { UsersService } from '../modules/users/users.service';
import { ParcelsService } from '../modules/parcels/parcels.service';
import { PostOfficesService } from '../modules/post-offices/post-offices.service';
import { mainKeyboard, adminKeyboard } from './keyboards/main.keyboard';
import { parcelsListKeyboard, adminMenuKeyboard, parcelActionsKeyboard } from './keyboards/inline.keyboard';
import { Messages } from '../constants/messages.constant';
import { ParcelStatusLabels, ParcelStatus } from '../constants/parcel-status.enum';
import { ConfigService } from '@nestjs/config';

interface BotContext extends Context {
  scene: Scenes.SceneContextScene<BotContext>;
  session: any;
}

@Injectable()
@Update()
export class TelegramUpdate {
  private readonly logger = new Logger(TelegramUpdate.name);
  private readonly adminIds: number[];

  constructor(
    private readonly usersService: UsersService,
    private readonly parcelsService: ParcelsService,
    private readonly postOfficesService: PostOfficesService,
    private readonly configService: ConfigService,
  ) {
    this.adminIds = this.configService
      .get<string>('ADMIN_IDS', '')
      .split(',')
      .filter((id) => id.trim())
      .map((id) => parseInt(id.trim(), 10));
  }

  @Start()
  async onStart(@Ctx() ctx: BotContext) {
    const user = ctx.from;
    if (!user) return;

    // Зберігаємо/оновлюємо користувача
    await this.usersService.createOrUpdate({
      telegramId: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
    });

    this.logger.log(`Користувач ${user.id} (@${user.username}) запустив бота`);

    await ctx.reply(Messages.WELCOME, { parse_mode: 'Markdown', ...mainKeyboard() });
  }

  @Help()
  async onHelp(@Ctx() ctx: BotContext) {
    await ctx.reply(Messages.HELP, { parse_mode: 'Markdown' });
  }

  @Command('find')
  async onFindCommand(@Ctx() ctx: BotContext) {
    await ctx.scene.enter('find-office');
  }

  @Command('create')
  async onCreateCommand(@Ctx() ctx: BotContext) {
    await ctx.scene.enter('create-parcel');
  }

  @Command('track')
  async onTrackCommand(@Ctx() ctx: BotContext) {
    await ctx.scene.enter('track-parcel');
  }

  @Command('my')
  async onMyParcelsCommand(@Ctx() ctx: BotContext) {
    await this.showUserParcels(ctx);
  }

  @Command('calc')
  async onCalcCommand(@Ctx() ctx: BotContext) {
    await ctx.scene.enter('calculator');
  }

  @Command('admin')
  async onAdminCommand(@Ctx() ctx: BotContext) {
    if (!this.isAdmin(ctx.from?.id)) {
      await ctx.reply('❌ У вас немає доступу до адміністративної панелі.');
      return;
    }

    await ctx.reply('🔧 *Адміністративна панель*', {
      parse_mode: 'Markdown',
      ...adminMenuKeyboard(),
    });
  }

  @On('text')
  async onText(@Ctx() ctx: BotContext) {
    const text = (ctx.message as any).text;

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
        await ctx.reply(Messages.INFO, { parse_mode: 'Markdown' });
        break;

      case '🔙 Головне меню':
        await ctx.reply('Головне меню', mainKeyboard());
        break;

      default:
        // Перевіряємо чи це номер відстеження
        if (this.looksLikeTrackingNumber(text)) {
          await this.trackParcelDirect(ctx, text);
        }
        break;
    }
  }

  @Action('my_parcels')
  async onMyParcelsAction(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    await this.showUserParcels(ctx);
  }

  @Action(/parcels_page:(\d+)/)
  async onParcelsPage(@Ctx() ctx: BotContext) {
    const page = parseInt((ctx.callbackQuery as any).data.split(':')[1], 10);
    await ctx.answerCbQuery();
    await this.showUserParcels(ctx, page);
  }

  @Action(/parcel:(.+)/)
  async onParcelDetails(@Ctx() ctx: BotContext) {
    const trackingNumber = (ctx.callbackQuery as any).data.split(':')[1];
    await ctx.answerCbQuery();

    const parcel = await this.parcelsService.findByTrackingNumber(trackingNumber);
    if (!parcel) {
      await ctx.reply(Messages.PARCEL_NOT_FOUND);
      return;
    }

    const message = this.parcelsService.formatParcelInfo(parcel);
    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...parcelActionsKeyboard(trackingNumber),
    });
  }

  @Action(/track:(.+)/)
  async onTrackAction(@Ctx() ctx: BotContext) {
    const trackingNumber = (ctx.callbackQuery as any).data.split(':')[1];
    await ctx.answerCbQuery();

    const parcel = await this.parcelsService.findByTrackingNumber(trackingNumber);
    if (!parcel) {
      await ctx.reply(Messages.PARCEL_NOT_FOUND);
      return;
    }

    const statusLabel = ParcelStatusLabels[parcel.currentStatus];
    let message = `📦 *${parcel.trackingNumber}*\n\n📊 *Статус:* ${statusLabel}\n\n`;

    if (parcel.statusHistory && parcel.statusHistory.length > 0) {
      message += `📜 *Історія:*\n`;
      message += this.parcelsService.formatStatusHistory(parcel.statusHistory);
    }

    await ctx.reply(message, { parse_mode: 'Markdown' });
  }

  @Action(/details:(.+)/)
  async onDetailsAction(@Ctx() ctx: BotContext) {
    const trackingNumber = (ctx.callbackQuery as any).data.split(':')[1];
    await ctx.answerCbQuery();

    const parcel = await this.parcelsService.findByTrackingNumber(trackingNumber);
    if (!parcel) {
      await ctx.reply(Messages.PARCEL_NOT_FOUND);
      return;
    }

    const message = this.parcelsService.formatParcelInfo(parcel);
    await ctx.reply(message, { parse_mode: 'Markdown' });
  }

  @Action('main_menu')
  async onMainMenu(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
    await ctx.reply('Головне меню', mainKeyboard());
  }

  // ============ ADMIN ACTIONS ============

  @Action('admin_stats')
  async onAdminStats(@Ctx() ctx: BotContext) {
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
      const label = ParcelStatusLabels[status as ParcelStatus] || status;
      message += `${label}: ${count}\n`;
    }

    await ctx.reply(message, { parse_mode: 'Markdown', ...adminMenuKeyboard() });
  }

  @Action('admin_find_parcel')
  async onAdminFindParcel(@Ctx() ctx: BotContext) {
    if (!this.isAdmin(ctx.from?.id)) {
      await ctx.answerCbQuery('Немає доступу');
      return;
    }

    await ctx.answerCbQuery();
    await ctx.reply('Введіть номер посилки для пошуку:');
  }

  @Action('admin_menu')
  async onAdminMenu(@Ctx() ctx: BotContext) {
    if (!this.isAdmin(ctx.from?.id)) {
      await ctx.answerCbQuery('Немає доступу');
      return;
    }

    await ctx.answerCbQuery();
    await ctx.reply('🔧 *Адміністративна панель*', {
      parse_mode: 'Markdown',
      ...adminMenuKeyboard(),
    });
  }

  @Action(/admin_change_status:(.+)/)
  async onAdminChangeStatus(@Ctx() ctx: BotContext) {
    if (!this.isAdmin(ctx.from?.id)) {
      await ctx.answerCbQuery('Немає доступу');
      return;
    }

    const trackingNumber = (ctx.callbackQuery as any).data.split(':')[1];
    await ctx.answerCbQuery();

    const buttons = Object.entries(ParcelStatusLabels).map(([status, label]) => [
      { text: label, callback_data: `set_status:${trackingNumber}:${status}` },
    ]);
    buttons.push([{ text: '🔙 Назад', callback_data: `parcel:${trackingNumber}` }]);

    await ctx.reply('Оберіть новий статус:', {
      reply_markup: { inline_keyboard: buttons },
    });
  }

  @Action(/set_status:(.+):(.+)/)
  async onSetStatus(@Ctx() ctx: BotContext) {
    if (!this.isAdmin(ctx.from?.id)) {
      await ctx.answerCbQuery('Немає доступу');
      return;
    }

    const parts = (ctx.callbackQuery as any).data.split(':');
    const trackingNumber = parts[1];
    const newStatus = parts[2] as ParcelStatus;

    await ctx.answerCbQuery();

    try {
      await this.parcelsService.updateStatus({
        trackingNumber,
        status: newStatus,
        comment: `Статус змінено адміністратором`,
      });

      const statusLabel = ParcelStatusLabels[newStatus];
      await ctx.reply(`✅ Статус посилки ${trackingNumber} змінено на: ${statusLabel}`);

      // Сповіщення відправника
      const parcel = await this.parcelsService.findByTrackingNumber(trackingNumber);
      if (parcel) {
        try {
          await ctx.telegram.sendMessage(
            parcel.senderTelegramId,
            `📦 Статус вашої посилки ${trackingNumber} змінено:\n${statusLabel}`,
          );
        } catch (e) {
          this.logger.warn('Не вдалося сповістити відправника');
        }
      }
    } catch (error) {
      await ctx.reply('❌ Помилка при зміні статусу');
    }
  }

  @Action('ignore')
  async onIgnore(@Ctx() ctx: BotContext) {
    await ctx.answerCbQuery();
  }

  // ============ HELPER METHODS ============

  private async showUserParcels(ctx: BotContext, page: number = 0) {
    const userId = ctx.from?.id;
    if (!userId) return;

    const parcels = await this.parcelsService.findByUser(userId);

    if (parcels.length === 0) {
      await ctx.reply(Messages.NO_PARCELS, mainKeyboard());
      return;
    }

    await ctx.reply(Messages.MY_PARCELS_HEADER, {
      parse_mode: 'Markdown',
      ...parcelsListKeyboard(parcels, page),
    });
  }

  private async trackParcelDirect(ctx: BotContext, input: string) {
    const digits = input.replace(/\D/g, '');
    if (digits.length !== 12) return;

    const trackingNumber = `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
    const parcel = await this.parcelsService.findByTrackingNumber(trackingNumber);

    if (parcel) {
      const statusLabel = ParcelStatusLabels[parcel.currentStatus];
      await ctx.reply(
        `📦 Знайдено посилку!\n\n*${trackingNumber}*\nСтатус: ${statusLabel}`,
        { parse_mode: 'Markdown', ...parcelActionsKeyboard(trackingNumber) },
      );
    }
  }

  private looksLikeTrackingNumber(text: string): boolean {
    const digits = text.replace(/\D/g, '');
    return digits.length === 12;
  }

  private isAdmin(userId?: number): boolean {
    if (!userId) return false;
    return this.adminIds.includes(userId);
  }
}





