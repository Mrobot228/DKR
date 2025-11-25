import { Markup } from 'telegraf';
import { ParcelStatus, ParcelStatusLabels } from '../../constants/parcel-status.enum';
import { Parcel } from '../../database/entities';

/**
 * Inline клавіатура для дій з посилкою
 */
export const parcelActionsKeyboard = (trackingNumber: string) => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('📍 Відстежити', `track:${trackingNumber}`),
      Markup.button.callback('📋 Деталі', `details:${trackingNumber}`),
    ],
    [Markup.button.callback('🔙 До списку', 'my_parcels')],
  ]);
};

/**
 * Inline клавіатура вибору статусу (для адміна)
 */
export const statusSelectionKeyboard = (trackingNumber: string) => {
  const buttons = Object.entries(ParcelStatusLabels).map(([status, label]) => [
    Markup.button.callback(label, `set_status:${trackingNumber}:${status}`),
  ]);

  buttons.push([Markup.button.callback('🔙 Назад', `admin_parcel:${trackingNumber}`)]);

  return Markup.inlineKeyboard(buttons);
};

/**
 * Inline клавіатура списку посилок
 */
export const parcelsListKeyboard = (parcels: Parcel[], page: number = 0, perPage: number = 5) => {
  const totalPages = Math.ceil(parcels.length / perPage);
  const startIdx = page * perPage;
  const endIdx = Math.min(startIdx + perPage, parcels.length);

  const buttons: ReturnType<typeof Markup.button.callback>[][] = [];

  // Кнопки для кожної посилки
  for (let i = startIdx; i < endIdx; i++) {
    const parcel = parcels[i];
    const statusEmoji = ParcelStatusLabels[parcel.currentStatus]?.split(' ')[0] || '📦';
    buttons.push([
      Markup.button.callback(`${statusEmoji} ${parcel.trackingNumber}`, `parcel:${parcel.trackingNumber}`),
    ]);
  }

  // Пагінація
  const navButtons: ReturnType<typeof Markup.button.callback>[] = [];
  if (page > 0) {
    navButtons.push(Markup.button.callback('⬅️ Назад', `parcels_page:${page - 1}`));
  }
  if (page < totalPages - 1) {
    navButtons.push(Markup.button.callback('Далі ➡️', `parcels_page:${page + 1}`));
  }

  if (navButtons.length > 0) {
    buttons.push(navButtons);
  }

  // Інформація про сторінку
  if (totalPages > 1) {
    buttons.push([Markup.button.callback(`📄 ${page + 1}/${totalPages}`, 'ignore')]);
  }

  return Markup.inlineKeyboard(buttons);
};

/**
 * Inline клавіатура підтвердження
 */
export const confirmInlineKeyboard = (confirmCallback: string, cancelCallback: string = 'cancel') => {
  return Markup.inlineKeyboard([
    [
      Markup.button.callback('✅ Підтвердити', confirmCallback),
      Markup.button.callback('❌ Скасувати', cancelCallback),
    ],
  ]);
};

/**
 * Inline клавіатура вибору типу доставки
 */
export const deliveryTypeInlineKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📦 Стандартна (3-5 днів)', 'delivery_standard')],
    [Markup.button.callback('⚡ Експрес (1-2 дні)', 'delivery_express')],
  ]);
};

/**
 * Inline клавіатура з посиланням на карту
 */
export const officeMapKeyboard = (lat: number, lng: number, officeNumber: string) => {
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;

  return Markup.inlineKeyboard([
    [Markup.button.url('🗺️ Відкрити на карті', googleMapsUrl)],
    [Markup.button.callback('📍 Вибрати це відділення', `select_office:${officeNumber}`)],
  ]);
};

/**
 * Inline клавіатура для списку найближчих відділень
 */
export const nearbyOfficesKeyboard = (
  offices: Array<{ office: { officeNumber: string; address: string }; distance: number }>,
) => {
  const buttons = offices.map((item) => [
    Markup.button.callback(
      `📍 №${item.office.officeNumber} (${item.distance.toFixed(1)} км)`,
      `office_info:${item.office.officeNumber}`,
    ),
  ]);

  buttons.push([Markup.button.callback('🔙 Головне меню', 'main_menu')]);

  return Markup.inlineKeyboard(buttons);
};

/**
 * Адміністративна клавіатура для посилки
 */
export const adminParcelKeyboard = (trackingNumber: string) => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📝 Змінити статус', `admin_change_status:${trackingNumber}`)],
    [
      Markup.button.callback('📍 Відстежити', `track:${trackingNumber}`),
      Markup.button.callback('📋 Деталі', `details:${trackingNumber}`),
    ],
    [Markup.button.callback('🔙 Назад', 'admin_menu')],
  ]);
};

/**
 * Адміністративне меню
 */
export const adminMenuKeyboard = () => {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📊 Статистика', 'admin_stats')],
    [Markup.button.callback('📦 Знайти посилку', 'admin_find_parcel')],
    [Markup.button.callback('🏢 Додати відділення', 'admin_add_office')],
    [Markup.button.callback('🔙 Головне меню', 'main_menu')],
  ]);
};





