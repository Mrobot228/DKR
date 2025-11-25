"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMenuKeyboard = exports.adminParcelKeyboard = exports.nearbyOfficesKeyboard = exports.officeMapKeyboard = exports.deliveryTypeInlineKeyboard = exports.confirmInlineKeyboard = exports.parcelsListKeyboard = exports.statusSelectionKeyboard = exports.parcelActionsKeyboard = void 0;
const telegraf_1 = require("telegraf");
const parcel_status_enum_1 = require("../../constants/parcel-status.enum");
const parcelActionsKeyboard = (trackingNumber) => {
    return telegraf_1.Markup.inlineKeyboard([
        [
            telegraf_1.Markup.button.callback('📍 Відстежити', `track:${trackingNumber}`),
            telegraf_1.Markup.button.callback('📋 Деталі', `details:${trackingNumber}`),
        ],
        [telegraf_1.Markup.button.callback('🔙 До списку', 'my_parcels')],
    ]);
};
exports.parcelActionsKeyboard = parcelActionsKeyboard;
const statusSelectionKeyboard = (trackingNumber) => {
    const buttons = Object.entries(parcel_status_enum_1.ParcelStatusLabels).map(([status, label]) => [
        telegraf_1.Markup.button.callback(label, `set_status:${trackingNumber}:${status}`),
    ]);
    buttons.push([telegraf_1.Markup.button.callback('🔙 Назад', `admin_parcel:${trackingNumber}`)]);
    return telegraf_1.Markup.inlineKeyboard(buttons);
};
exports.statusSelectionKeyboard = statusSelectionKeyboard;
const parcelsListKeyboard = (parcels, page = 0, perPage = 5) => {
    const totalPages = Math.ceil(parcels.length / perPage);
    const startIdx = page * perPage;
    const endIdx = Math.min(startIdx + perPage, parcels.length);
    const buttons = [];
    for (let i = startIdx; i < endIdx; i++) {
        const parcel = parcels[i];
        const statusEmoji = parcel_status_enum_1.ParcelStatusLabels[parcel.currentStatus]?.split(' ')[0] || '📦';
        buttons.push([
            telegraf_1.Markup.button.callback(`${statusEmoji} ${parcel.trackingNumber}`, `parcel:${parcel.trackingNumber}`),
        ]);
    }
    const navButtons = [];
    if (page > 0) {
        navButtons.push(telegraf_1.Markup.button.callback('⬅️ Назад', `parcels_page:${page - 1}`));
    }
    if (page < totalPages - 1) {
        navButtons.push(telegraf_1.Markup.button.callback('Далі ➡️', `parcels_page:${page + 1}`));
    }
    if (navButtons.length > 0) {
        buttons.push(navButtons);
    }
    if (totalPages > 1) {
        buttons.push([telegraf_1.Markup.button.callback(`📄 ${page + 1}/${totalPages}`, 'ignore')]);
    }
    return telegraf_1.Markup.inlineKeyboard(buttons);
};
exports.parcelsListKeyboard = parcelsListKeyboard;
const confirmInlineKeyboard = (confirmCallback, cancelCallback = 'cancel') => {
    return telegraf_1.Markup.inlineKeyboard([
        [
            telegraf_1.Markup.button.callback('✅ Підтвердити', confirmCallback),
            telegraf_1.Markup.button.callback('❌ Скасувати', cancelCallback),
        ],
    ]);
};
exports.confirmInlineKeyboard = confirmInlineKeyboard;
const deliveryTypeInlineKeyboard = () => {
    return telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.callback('📦 Стандартна (3-5 днів)', 'delivery_standard')],
        [telegraf_1.Markup.button.callback('⚡ Експрес (1-2 дні)', 'delivery_express')],
    ]);
};
exports.deliveryTypeInlineKeyboard = deliveryTypeInlineKeyboard;
const officeMapKeyboard = (lat, lng, officeNumber) => {
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    return telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.url('🗺️ Відкрити на карті', googleMapsUrl)],
        [telegraf_1.Markup.button.callback('📍 Вибрати це відділення', `select_office:${officeNumber}`)],
    ]);
};
exports.officeMapKeyboard = officeMapKeyboard;
const nearbyOfficesKeyboard = (offices) => {
    const buttons = offices.map((item) => [
        telegraf_1.Markup.button.callback(`📍 №${item.office.officeNumber} (${item.distance.toFixed(1)} км)`, `office_info:${item.office.officeNumber}`),
    ]);
    buttons.push([telegraf_1.Markup.button.callback('🔙 Головне меню', 'main_menu')]);
    return telegraf_1.Markup.inlineKeyboard(buttons);
};
exports.nearbyOfficesKeyboard = nearbyOfficesKeyboard;
const adminParcelKeyboard = (trackingNumber) => {
    return telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.callback('📝 Змінити статус', `admin_change_status:${trackingNumber}`)],
        [
            telegraf_1.Markup.button.callback('📍 Відстежити', `track:${trackingNumber}`),
            telegraf_1.Markup.button.callback('📋 Деталі', `details:${trackingNumber}`),
        ],
        [telegraf_1.Markup.button.callback('🔙 Назад', 'admin_menu')],
    ]);
};
exports.adminParcelKeyboard = adminParcelKeyboard;
const adminMenuKeyboard = () => {
    return telegraf_1.Markup.inlineKeyboard([
        [telegraf_1.Markup.button.callback('📊 Статистика', 'admin_stats')],
        [telegraf_1.Markup.button.callback('📦 Знайти посилку', 'admin_find_parcel')],
        [telegraf_1.Markup.button.callback('🏢 Додати відділення', 'admin_add_office')],
        [telegraf_1.Markup.button.callback('🔙 Головне меню', 'main_menu')],
    ]);
};
exports.adminMenuKeyboard = adminMenuKeyboard;
//# sourceMappingURL=inline.keyboard.js.map