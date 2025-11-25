import { Markup } from 'telegraf';

/**
 * Головне меню бота
 */
export const mainKeyboard = () => {
  return Markup.keyboard([
    ['🔍 Знайти відділення', '📦 Створити накладну'],
    ['📍 Відстежити посилку', '📋 Мої посилки'],
    ['💰 Калькулятор', 'ℹ️ Інформація'],
  ])
    .resize()
    .persistent();
};

/**
 * Клавіатура скасування
 */
export const cancelKeyboard = () => {
  return Markup.keyboard([['❌ Скасувати']]).resize().oneTime();
};

/**
 * Клавіатура підтвердження
 */
export const confirmKeyboard = () => {
  return Markup.keyboard([['✅ Підтвердити', '❌ Скасувати']]).resize().oneTime();
};

/**
 * Клавіатура вибору типу доставки
 */
export const deliveryTypeKeyboard = () => {
  return Markup.keyboard([['📦 Стандартна', '⚡ Експрес'], ['❌ Скасувати']]).resize().oneTime();
};

/**
 * Клавіатура з можливістю надіслати локацію
 */
export const locationKeyboard = () => {
  return Markup.keyboard([
    [Markup.button.locationRequest('📍 Надіслати моє місцезнаходження')],
    ['❌ Скасувати'],
  ])
    .resize()
    .oneTime();
};

/**
 * Клавіатура з можливістю надіслати контакт
 */
export const contactKeyboard = () => {
  return Markup.keyboard([
    [Markup.button.contactRequest('📱 Поділитися номером телефону')],
    ['❌ Скасувати'],
  ])
    .resize()
    .oneTime();
};

/**
 * Адміністративне меню
 */
export const adminKeyboard = () => {
  return Markup.keyboard([
    ['📊 Статистика', '📦 Управління посилками'],
    ['🏢 Відділення', '👥 Користувачі'],
    ['🔙 Головне меню'],
  ]).resize();
};




