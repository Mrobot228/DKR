/**
 * Генератор номерів відстеження
 */

/**
 * Генерувати унікальний 12-значний номер відстеження
 * Формат: XXXX-XXXX-XXXX
 */
export const generateTrackingNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  const combined = (timestamp + random).slice(-12);

  return formatTrackingNumber(combined);
};

/**
 * Форматувати 12 цифр в номер відстеження
 */
export const formatTrackingNumber = (digits: string): string => {
  const cleanDigits = digits.replace(/\D/g, '').slice(-12).padStart(12, '0');
  return `${cleanDigits.slice(0, 4)}-${cleanDigits.slice(4, 8)}-${cleanDigits.slice(8, 12)}`;
};

/**
 * Перевірити чи є рядок валідним номером відстеження
 */
export const isValidTrackingNumber = (input: string): boolean => {
  const digits = input.replace(/\D/g, '');
  return digits.length === 12;
};

/**
 * Нормалізувати введений номер відстеження
 */
export const normalizeTrackingNumber = (input: string): string | null => {
  const digits = input.replace(/\D/g, '');
  if (digits.length !== 12) return null;
  return formatTrackingNumber(digits);
};




