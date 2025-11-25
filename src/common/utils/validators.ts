/**
 * Утиліти валідації
 */

/**
 * Валідація українського номера телефону
 */
export const validatePhone = (phone: string): boolean => {
  const normalized = phone.replace(/[\s\-\(\)]/g, '');
  return /^(\+?380|0)\d{9}$/.test(normalized);
};

/**
 * Нормалізація номера телефону до формату +380XXXXXXXXX
 */
export const normalizePhone = (phone: string): string => {
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  if (normalized.startsWith('0')) {
    normalized = '+38' + normalized;
  } else if (!normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  return normalized;
};

/**
 * Валідація номера відстеження (12 цифр)
 */
export const validateTrackingNumber = (number: string): boolean => {
  const digits = number.replace(/\D/g, '');
  return digits.length === 12;
};

/**
 * Форматування номера відстеження (XXXX-XXXX-XXXX)
 */
export const formatTrackingNumber = (number: string): string => {
  const digits = number.replace(/\D/g, '');
  if (digits.length !== 12) return number;
  return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
};

/**
 * Валідація ваги (0.01 - 1000 кг)
 */
export const validateWeight = (weight: number): boolean => {
  return !isNaN(weight) && weight > 0 && weight <= 1000;
};

/**
 * Валідація оголошеної вартості (>= 0)
 */
export const validateDeclaredValue = (value: number): boolean => {
  return !isNaN(value) && value >= 0;
};

/**
 * Форматування дати для відображення
 */
export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Форматування дати та часу для відображення
 */
export const formatDateTime = (date: Date): string => {
  return date.toLocaleString('uk-UA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Форматування грошової суми
 */
export const formatMoney = (amount: number): string => {
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: 'UAH',
    minimumFractionDigits: 2,
  }).format(amount);
};





