import { Injectable, Logger } from '@nestjs/common';
import { Scene, SceneEnter, On, Ctx, Action } from 'nestjs-telegraf';
import { Context, Markup } from 'telegraf';
import { MapsService, PostOfficeResult } from '../../modules/maps/maps.service';
import { cancelKeyboard, locationKeyboard, mainKeyboard } from '../keyboards/main.keyboard';
import { Messages } from '../../constants/messages.constant';

interface FindOfficeContext extends Context {
  scene: any;
  session: {
    userLat?: number;
    userLng?: number;
    foundOffices?: PostOfficeResult[];
  };
}

@Injectable()
@Scene('find-office')
export class FindOfficeScene {
  private readonly logger = new Logger(FindOfficeScene.name);

  constructor(private readonly mapsService: MapsService) {}

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: FindOfficeContext) {
    ctx.session.foundOffices = [];

    await ctx.reply(
      `🔍 *Пошук поштового відділення*\n\n` +
        `Введіть адресу для пошуку найближчих відділень пошти:\n` +
        `_(Наприклад: Київ, вул. Хрещатик 1)_\n\n` +
        `Або надішліть своє місцезнаходження 📍`,
      { parse_mode: 'Markdown', ...locationKeyboard() },
    );
  }

  @On('location')
  async onLocation(@Ctx() ctx: FindOfficeContext) {
    const location = (ctx.message as any).location;
    ctx.session.userLat = location.latitude;
    ctx.session.userLng = location.longitude;

    await this.searchAndShowOffices(ctx, location.latitude, location.longitude);
  }

  @On('text')
  async onText(@Ctx() ctx: FindOfficeContext) {
    const text = (ctx.message as any).text;

    if (text === '❌ Скасувати') {
      await ctx.reply('Пошук скасовано', mainKeyboard());
      return ctx.scene.leave();
    }

    await ctx.reply('🔄 Шукаю адресу та найближчі відділення пошти...');

    // Геокодуємо адресу
    const result = await this.mapsService.geocodeAddress(text);

    if (!result) {
      await ctx.reply(
        '❌ Не вдалося знайти вказану адресу.\n\n' +
          'Спробуйте ввести адресу детальніше, наприклад:\n' +
          '• Київ, Хрещатик 1\n' +
          '• Львів, проспект Свободи 10\n\n' +
          'Або надішліть своє місцезнаходження 📍',
        locationKeyboard(),
      );
      return;
    }

    ctx.session.userLat = result.coordinates.lat;
    ctx.session.userLng = result.coordinates.lng;

    await ctx.reply(`📍 Знайдено: _${result.formattedAddress}_`, { parse_mode: 'Markdown' });
    await this.searchAndShowOffices(ctx, result.coordinates.lat, result.coordinates.lng);
  }

  private async searchAndShowOffices(ctx: FindOfficeContext, lat: number, lng: number) {
    await ctx.reply('🔍 Шукаю поштові відділення поблизу...');

    // Шукаємо реальні поштові відділення
    const offices = await this.mapsService.findNearestPostOffices(lat, lng, 5, 10);

    if (offices.length === 0) {
      await ctx.reply(
        '😔 На жаль, не знайдено поштових відділень в радіусі 5 км.\n\n' +
          'Спробуйте:\n' +
          '• Вказати іншу адресу\n' +
          '• Надіслати своє місцезнаходження',
        locationKeyboard(),
      );
      return;
    }

    ctx.session.foundOffices = offices;

    // Формуємо повідомлення
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

    // Створюємо inline кнопки для кожного відділення
    const buttons = offices.slice(0, 5).map((office, index) => {
      const emoji = this.mapsService.getOfficeEmoji(office.type);
      return [
        Markup.button.callback(
          `${emoji} ${index + 1}. ${office.name.slice(0, 25)}... (${this.mapsService.formatDistance(office.distance)})`,
          `office_details:${index}`,
        ),
      ];
    });

    buttons.push([Markup.button.callback('🔙 Головне меню', 'main_menu')]);

    await ctx.reply(message, {
      parse_mode: 'Markdown',
      link_preview_options: { is_disabled: true },
      reply_markup: { inline_keyboard: buttons },
    });
  }

  @Action(/office_details:(\d+)/)
  async onOfficeDetails(@Ctx() ctx: FindOfficeContext) {
    const index = parseInt((ctx.callbackQuery as any).data.split(':')[1], 10);
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

    // Кнопки
    const buttons: any[][] = [
      [Markup.button.url('🗺️ Відкрити на карті', this.mapsService.getGoogleMapsLink(office.lat, office.lng))],
    ];

    // Якщо є координати користувача - додаємо кнопку маршруту
    if (ctx.session.userLat && ctx.session.userLng) {
      buttons.push([
        Markup.button.url(
          '🚗 Прокласти маршрут',
          this.mapsService.getDirectionsLink(
            ctx.session.userLat,
            ctx.session.userLng,
            office.lat,
            office.lng,
          ),
        ),
      ]);
    }

    buttons.push([Markup.button.callback('🔙 До списку', 'back_to_list')]);

    await ctx.answerCbQuery();
    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: buttons },
    });
  }

  @Action('back_to_list')
  async onBackToList(@Ctx() ctx: FindOfficeContext) {
    await ctx.answerCbQuery();

    const offices = ctx.session.foundOffices || [];
    if (offices.length === 0) {
      await ctx.reply('Список порожній', mainKeyboard());
      return ctx.scene.leave();
    }

    // Повторно показуємо список
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
        Markup.button.callback(
          `${emoji} ${index + 1}. ${office.name.slice(0, 25)}...`,
          `office_details:${index}`,
        ),
      ];
    });

    buttons.push([Markup.button.callback('🔙 Головне меню', 'main_menu')]);

    await ctx.editMessageText(message, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: buttons },
    });
  }

  @Action('main_menu')
  async onMainMenu(@Ctx() ctx: FindOfficeContext) {
    await ctx.answerCbQuery();
    await ctx.reply('Головне меню', mainKeyboard());
    await ctx.scene.leave();
  }
}
