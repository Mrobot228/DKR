import { Injectable, Logger } from '@nestjs/common';
import { Scene, SceneEnter, On, Ctx, Action } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { ParcelsService } from '../../modules/parcels/parcels.service';
import { cancelKeyboard, mainKeyboard } from '../keyboards/main.keyboard';
import { deliveryTypeInlineKeyboard } from '../keyboards/inline.keyboard';

interface CalculatorContext extends Context {
  scene: any;
  session: {
    calcData: {
      fromCity?: string;
      toCity?: string;
      weight?: number;
    };
    step: string;
  };
}

@Injectable()
@Scene('calculator')
export class CalculatorScene {
  private readonly logger = new Logger(CalculatorScene.name);

  constructor(private readonly parcelsService: ParcelsService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: CalculatorContext) {
    ctx.session.calcData = {};
    ctx.session.step = 'FROM_CITY';

    await ctx.reply(
      '💰 *Калькулятор вартості доставки*\n\nВведіть місто відправлення:',
      { parse_mode: 'Markdown', ...cancelKeyboard() },
    );
  }

  @On('text')
  async onText(@Ctx() ctx: CalculatorContext) {
    const text = (ctx.message as any).text.trim();

    if (text === '❌ Скасувати') {
      await ctx.reply('Розрахунок скасовано', mainKeyboard());
      return ctx.scene.leave();
    }

    const { step, calcData } = ctx.session;

    switch (step) {
      case 'FROM_CITY':
        calcData.fromCity = text;
        ctx.session.step = 'TO_CITY';
        await ctx.reply('Введіть місто отримання:', cancelKeyboard());
        break;

      case 'TO_CITY':
        calcData.toCity = text;
        ctx.session.step = 'WEIGHT';
        await ctx.reply(
          'Введіть вагу посилки (кг):\n_(наприклад: 2.5)_',
          { parse_mode: 'Markdown', ...cancelKeyboard() },
        );
        break;

      case 'WEIGHT':
        const weight = parseFloat(text.replace(',', '.'));
        if (isNaN(weight) || weight <= 0 || weight > 1000) {
          await ctx.reply('❌ Невірний формат ваги. Введіть число від 0.01 до 1000:', cancelKeyboard());
          return;
        }
        calcData.weight = weight;
        await this.showResults(ctx);
        break;
    }
  }

  private async showResults(ctx: CalculatorContext) {
    const { fromCity, toCity, weight } = ctx.session.calcData;

    const standardCost = this.parcelsService.calculateDeliveryCost(
      fromCity!,
      toCity!,
      weight!,
      'standard',
    );
    const expressCost = this.parcelsService.calculateDeliveryCost(
      fromCity!,
      toCity!,
      weight!,
      'express',
    );

    const standardTime = this.parcelsService.getDeliveryTime('standard');
    const expressTime = this.parcelsService.getDeliveryTime('express');

    const message =
      `💰 *Розрахунок вартості доставки*\n\n` +
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

    await ctx.reply(message, { parse_mode: 'Markdown', ...mainKeyboard() });
    await ctx.scene.leave();
  }
}





