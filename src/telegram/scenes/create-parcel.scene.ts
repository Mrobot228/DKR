import { Injectable, Logger } from '@nestjs/common';
import { Scene, SceneEnter, On, Ctx, Action } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ParcelsService } from '../../modules/parcels/parcels.service';
import { UsersService } from '../../modules/users/users.service';
import { PostOfficesService } from '../../modules/post-offices/post-offices.service';
import { cancelKeyboard, mainKeyboard } from '../keyboards/main.keyboard';
import { deliveryTypeInlineKeyboard, confirmInlineKeyboard } from '../keyboards/inline.keyboard';
import { CreateParcelDto } from '../../modules/parcels/dto/create-parcel.dto';
import { Messages, CreateParcelSteps } from '../../constants/messages.constant';

interface ParcelData extends Partial<CreateParcelDto> {
  senderOfficeNumber?: string;
  recipientOfficeNumber?: string;
}

interface CreateParcelContext extends Context {
  scene: any;
  session: {
    parcelData: ParcelData;
    step: string;
  };
}

type StepKey = keyof typeof CreateParcelSteps;

@Injectable()
@Scene('create-parcel')
export class CreateParcelScene {
  private readonly logger = new Logger(CreateParcelScene.name);

  constructor(
    private readonly parcelsService: ParcelsService,
    private readonly usersService: UsersService,
    private readonly postOfficesService: PostOfficesService,
  ) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: CreateParcelContext) {
    ctx.session.parcelData = {};
    ctx.session.step = 'SENDER_NAME';

    const step = CreateParcelSteps.SENDER_NAME;
    await ctx.reply(
      `📦 *Створення накладної*\n\n*Крок ${step.step} з ${step.total}:* ${step.message}`,
      { parse_mode: 'Markdown', ...cancelKeyboard() },
    );
  }

  @On('text')
  async onText(@Ctx() ctx: CreateParcelContext) {
    const text = (ctx.message as any).text;

    if (text === '❌ Скасувати') {
      await ctx.reply(Messages.CREATE_PARCEL_CANCELLED, mainKeyboard());
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
          await ctx.reply(Messages.ERROR_INVALID_PHONE, cancelKeyboard());
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
        // Зберігаємо номер відділення як текст
        parcelData.senderOfficeNumber = text;
        // Шукаємо відділення в базі
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
          await ctx.reply(Messages.ERROR_INVALID_PHONE, cancelKeyboard());
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
        // Зберігаємо номер відділення як текст
        parcelData.recipientOfficeNumber = text;
        // Шукаємо відділення в базі
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
          await ctx.reply(Messages.ERROR_INVALID_WEIGHT, cancelKeyboard());
          return;
        }
        parcelData.weight = weight;
        await this.nextStep(ctx, 'DECLARED_VALUE');
        break;

      case 'DECLARED_VALUE':
        const value = parseFloat(text.replace(',', '.'));
        if (isNaN(value) || value < 0) {
          await ctx.reply(Messages.ERROR_INVALID_VALUE, cancelKeyboard());
          return;
        }
        parcelData.declaredValue = value;
        await this.askDeliveryType(ctx);
        break;
    }
  }

  @Action('delivery_standard')
  async onDeliveryStandard(@Ctx() ctx: CreateParcelContext) {
    await ctx.answerCbQuery();
    ctx.session.parcelData.deliveryType = 'standard';
    await this.showConfirmation(ctx);
  }

  @Action('delivery_express')
  async onDeliveryExpress(@Ctx() ctx: CreateParcelContext) {
    await ctx.answerCbQuery();
    ctx.session.parcelData.deliveryType = 'express';
    await this.showConfirmation(ctx);
  }

  @Action('confirm_parcel')
  async onConfirmParcel(@Ctx() ctx: CreateParcelContext) {
    await ctx.answerCbQuery();
    await this.createParcel(ctx);
  }

  @Action('cancel_parcel')
  async onCancelParcel(@Ctx() ctx: CreateParcelContext) {
    await ctx.answerCbQuery();
    await ctx.reply(Messages.CREATE_PARCEL_CANCELLED, mainKeyboard());
    await ctx.scene.leave();
  }

  private async nextStep(ctx: CreateParcelContext, nextStepKey: StepKey) {
    ctx.session.step = nextStepKey;
    const stepInfo = CreateParcelSteps[nextStepKey];

    await ctx.reply(
      `*Крок ${stepInfo.step} з ${stepInfo.total}:* ${stepInfo.message}`,
      { parse_mode: 'Markdown', ...cancelKeyboard() },
    );
  }

  private async askDeliveryType(ctx: CreateParcelContext) {
    ctx.session.step = 'DELIVERY_TYPE';

    // Розраховуємо приблизну вартість
    const { senderCity, recipientCity, weight } = ctx.session.parcelData;
    const standardCost = this.parcelsService.calculateDeliveryCost(
      senderCity!,
      recipientCity!,
      weight!,
      'standard',
    );
    const expressCost = this.parcelsService.calculateDeliveryCost(
      senderCity!,
      recipientCity!,
      weight!,
      'express',
    );

    const standardTime = this.parcelsService.getDeliveryTime('standard');
    const expressTime = this.parcelsService.getDeliveryTime('express');

    await ctx.reply(
      `*Оберіть тип доставки:*\n\n` +
        `📦 *Стандартна доставка*\n` +
        `   Термін: ${standardTime.min}-${standardTime.max} днів\n` +
        `   Вартість: ~${standardCost} грн\n\n` +
        `⚡ *Експрес доставка*\n` +
        `   Термін: ${expressTime.min}-${expressTime.max} дні\n` +
        `   Вартість: ~${expressCost} грн`,
      { parse_mode: 'Markdown', ...deliveryTypeInlineKeyboard() },
    );
  }

  private async showConfirmation(ctx: CreateParcelContext) {
    const data = ctx.session.parcelData;
    const deliveryCost = this.parcelsService.calculateDeliveryCost(
      data.senderCity!,
      data.recipientCity!,
      data.weight!,
      data.deliveryType as 'standard' | 'express',
    );

    const message =
      `📋 *Перевірте дані накладної:*\n\n` +
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
      ...confirmInlineKeyboard('confirm_parcel', 'cancel_parcel'),
    });
  }

  private async createParcel(ctx: CreateParcelContext) {
    try {
      const data = ctx.session.parcelData;
      data.senderTelegramId = ctx.from!.id;

      // Видаляємо тимчасові поля
      const { senderOfficeNumber, recipientOfficeNumber, ...parcelData } = data;

      const parcel = await this.parcelsService.create(parcelData as CreateParcelDto);

      await ctx.reply(
        Messages.PARCEL_CREATED(parcel.trackingNumber),
        { parse_mode: 'Markdown', ...mainKeyboard() },
      );

      // Спробуємо сповістити отримувача (якщо він є користувачем бота)
      await this.notifyRecipient(ctx, parcel.trackingNumber, data);

      await ctx.scene.leave();
    } catch (error) {
      this.logger.error('Помилка створення посилки:', error);
      await ctx.reply(
        '❌ Помилка при створенні накладної.\n\nСпробуйте ще раз пізніше.',
        mainKeyboard(),
      );
      await ctx.scene.leave();
    }
  }

  private async notifyRecipient(ctx: CreateParcelContext, trackingNumber: string, data: ParcelData) {
    try {
      const recipient = await this.usersService.findByPhone(data.recipientPhone!);
      if (recipient && recipient.telegramId !== ctx.from!.id) {
        await ctx.telegram.sendMessage(
          recipient.telegramId,
          `📬 *Для вас створено посилку!*\n\n` +
            `Відправник: ${data.senderName}\n` +
            `Місто відправлення: ${data.senderCity}\n\n` +
            `📋 Номер відстеження:\n\`${trackingNumber}\`\n\n` +
            `Ви можете відстежити посилку за цим номером.`,
          { parse_mode: 'Markdown' },
        );
      }
    } catch (error) {
      this.logger.warn('Не вдалося сповістити отримувача:', error);
    }
  }

  private validatePhone(phone: string): boolean {
    const normalized = phone.replace(/[\s\-\(\)]/g, '');
    return /^(\+?380|0)\d{9}$/.test(normalized);
  }

  private normalizePhone(phone: string): string {
    let normalized = phone.replace(/[\s\-\(\)]/g, '');
    if (normalized.startsWith('0')) {
      normalized = '+38' + normalized;
    } else if (!normalized.startsWith('+')) {
      normalized = '+' + normalized;
    }
    return normalized;
  }
}
