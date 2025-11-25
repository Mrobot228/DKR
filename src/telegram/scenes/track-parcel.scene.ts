import { Injectable, Logger } from '@nestjs/common';
import { Scene, SceneEnter, On, Ctx } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ParcelsService } from '../../modules/parcels/parcels.service';
import { cancelKeyboard, mainKeyboard } from '../keyboards/main.keyboard';
import { parcelActionsKeyboard } from '../keyboards/inline.keyboard';
import { Messages } from '../../constants/messages.constant';
import { ParcelStatusLabels } from '../../constants/parcel-status.enum';

interface TrackParcelContext extends Context {
  scene: any;
  session: any;
}

@Injectable()
@Scene('track-parcel')
export class TrackParcelScene {
  private readonly logger = new Logger(TrackParcelScene.name);

  constructor(private readonly parcelsService: ParcelsService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: TrackParcelContext) {
    await ctx.reply(Messages.TRACK_PROMPT, {
      parse_mode: 'Markdown',
      ...cancelKeyboard(),
    });
  }

  @On('text')
  async onText(@Ctx() ctx: TrackParcelContext) {
    const text = (ctx.message as any).text.trim();

    if (text === '❌ Скасувати') {
      await ctx.reply('Пошук скасовано', mainKeyboard());
      return ctx.scene.leave();
    }

    // Валідація формату номера
    const trackingNumber = this.normalizeTrackingNumber(text);
    if (!this.validateTrackingNumber(trackingNumber)) {
      await ctx.reply(Messages.ERROR_INVALID_TRACKING, cancelKeyboard());
      return;
    }

    await ctx.reply('🔄 Шукаю посилку...');

    const parcel = await this.parcelsService.findByTrackingNumber(trackingNumber);

    if (!parcel) {
      await ctx.reply(Messages.PARCEL_NOT_FOUND, cancelKeyboard());
      return;
    }

    // Формуємо повідомлення з деталями
    const statusLabel = ParcelStatusLabels[parcel.currentStatus] || parcel.currentStatus;

    let message =
      `📦 *Посилка ${parcel.trackingNumber}*\n\n` +
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

    // Додаємо історію статусів
    if (parcel.statusHistory && parcel.statusHistory.length > 0) {
      message += `\n📜 *Історія:*\n`;
      message += this.parcelsService.formatStatusHistory(parcel.statusHistory);
    }

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      ...parcelActionsKeyboard(parcel.trackingNumber),
    });

    await ctx.scene.leave();
  }

  private validateTrackingNumber(number: string): boolean {
    // Формат: XXXX-XXXX-XXXX (12 цифр з дефісами)
    return /^\d{4}-\d{4}-\d{4}$/.test(number);
  }

  private normalizeTrackingNumber(input: string): string {
    // Видаляємо всі символи крім цифр
    const digits = input.replace(/\D/g, '');

    // Якщо 12 цифр - форматуємо
    if (digits.length === 12) {
      return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
    }

    // Інакше повертаємо як є (для валідації)
    return input;
  }
}





