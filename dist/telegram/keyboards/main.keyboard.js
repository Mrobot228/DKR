"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminKeyboard = exports.contactKeyboard = exports.locationKeyboard = exports.deliveryTypeKeyboard = exports.confirmKeyboard = exports.cancelKeyboard = exports.mainKeyboard = void 0;
const telegraf_1 = require("telegraf");
const mainKeyboard = () => {
    return telegraf_1.Markup.keyboard([
        ['🔍 Знайти відділення', '📦 Створити накладну'],
        ['📍 Відстежити посилку', '📋 Мої посилки'],
        ['💰 Калькулятор', 'ℹ️ Інформація'],
    ])
        .resize()
        .persistent();
};
exports.mainKeyboard = mainKeyboard;
const cancelKeyboard = () => {
    return telegraf_1.Markup.keyboard([['❌ Скасувати']]).resize().oneTime();
};
exports.cancelKeyboard = cancelKeyboard;
const confirmKeyboard = () => {
    return telegraf_1.Markup.keyboard([['✅ Підтвердити', '❌ Скасувати']]).resize().oneTime();
};
exports.confirmKeyboard = confirmKeyboard;
const deliveryTypeKeyboard = () => {
    return telegraf_1.Markup.keyboard([['📦 Стандартна', '⚡ Експрес'], ['❌ Скасувати']]).resize().oneTime();
};
exports.deliveryTypeKeyboard = deliveryTypeKeyboard;
const locationKeyboard = () => {
    return telegraf_1.Markup.keyboard([
        [telegraf_1.Markup.button.locationRequest('📍 Надіслати моє місцезнаходження')],
        ['❌ Скасувати'],
    ])
        .resize()
        .oneTime();
};
exports.locationKeyboard = locationKeyboard;
const contactKeyboard = () => {
    return telegraf_1.Markup.keyboard([
        [telegraf_1.Markup.button.contactRequest('📱 Поділитися номером телефону')],
        ['❌ Скасувати'],
    ])
        .resize()
        .oneTime();
};
exports.contactKeyboard = contactKeyboard;
const adminKeyboard = () => {
    return telegraf_1.Markup.keyboard([
        ['📊 Статистика', '📦 Управління посилками'],
        ['🏢 Відділення', '👥 Користувачі'],
        ['🔙 Головне меню'],
    ]).resize();
};
exports.adminKeyboard = adminKeyboard;
//# sourceMappingURL=main.keyboard.js.map