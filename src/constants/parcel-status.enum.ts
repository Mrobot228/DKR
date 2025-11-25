/**
 * Enum статусів посилки
 */
export enum ParcelStatus {
  AWAITING_SHIPMENT = 'awaiting_shipment',
  ACCEPTED_AT_ORIGIN = 'accepted_at_origin',
  IN_TRANSIT = 'in_transit',
  ARRIVED_AT_DESTINATION = 'arrived_at_destination',
  AT_RECIPIENT_OFFICE = 'at_recipient_office',
  DELIVERED = 'delivered',
  RETURNED_TO_SENDER = 'returned_to_sender',
}

/**
 * Українські назви статусів з емодзі
 */
export const ParcelStatusLabels: Record<ParcelStatus, string> = {
  [ParcelStatus.AWAITING_SHIPMENT]: '📝 Очікує відправлення',
  [ParcelStatus.ACCEPTED_AT_ORIGIN]: '📦 Прийнято на відділенні відправлення',
  [ParcelStatus.IN_TRANSIT]: '🚚 В дорозі',
  [ParcelStatus.ARRIVED_AT_DESTINATION]: '🏙️ Прибула до міста отримувача',
  [ParcelStatus.AT_RECIPIENT_OFFICE]: '📬 На відділенні отримання',
  [ParcelStatus.DELIVERED]: '✅ Видано отримувачу',
  [ParcelStatus.RETURNED_TO_SENDER]: '↩️ Повернення відправнику',
};

/**
 * Емодзі для статусів (окремо)
 */
export const ParcelStatusEmojis: Record<ParcelStatus, string> = {
  [ParcelStatus.AWAITING_SHIPMENT]: '📝',
  [ParcelStatus.ACCEPTED_AT_ORIGIN]: '📦',
  [ParcelStatus.IN_TRANSIT]: '🚚',
  [ParcelStatus.ARRIVED_AT_DESTINATION]: '🏙️',
  [ParcelStatus.AT_RECIPIENT_OFFICE]: '📬',
  [ParcelStatus.DELIVERED]: '✅',
  [ParcelStatus.RETURNED_TO_SENDER]: '↩️',
};

/**
 * Порядок статусів для відображення прогресу
 */
export const ParcelStatusOrder: ParcelStatus[] = [
  ParcelStatus.AWAITING_SHIPMENT,
  ParcelStatus.ACCEPTED_AT_ORIGIN,
  ParcelStatus.IN_TRANSIT,
  ParcelStatus.ARRIVED_AT_DESTINATION,
  ParcelStatus.AT_RECIPIENT_OFFICE,
  ParcelStatus.DELIVERED,
];





