"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelStatusOrder = exports.ParcelStatusEmojis = exports.ParcelStatusLabels = exports.ParcelStatus = void 0;
var ParcelStatus;
(function (ParcelStatus) {
    ParcelStatus["AWAITING_SHIPMENT"] = "awaiting_shipment";
    ParcelStatus["ACCEPTED_AT_ORIGIN"] = "accepted_at_origin";
    ParcelStatus["IN_TRANSIT"] = "in_transit";
    ParcelStatus["ARRIVED_AT_DESTINATION"] = "arrived_at_destination";
    ParcelStatus["AT_RECIPIENT_OFFICE"] = "at_recipient_office";
    ParcelStatus["DELIVERED"] = "delivered";
    ParcelStatus["RETURNED_TO_SENDER"] = "returned_to_sender";
})(ParcelStatus || (exports.ParcelStatus = ParcelStatus = {}));
exports.ParcelStatusLabels = {
    [ParcelStatus.AWAITING_SHIPMENT]: '📝 Очікує відправлення',
    [ParcelStatus.ACCEPTED_AT_ORIGIN]: '📦 Прийнято на відділенні відправлення',
    [ParcelStatus.IN_TRANSIT]: '🚚 В дорозі',
    [ParcelStatus.ARRIVED_AT_DESTINATION]: '🏙️ Прибула до міста отримувача',
    [ParcelStatus.AT_RECIPIENT_OFFICE]: '📬 На відділенні отримання',
    [ParcelStatus.DELIVERED]: '✅ Видано отримувачу',
    [ParcelStatus.RETURNED_TO_SENDER]: '↩️ Повернення відправнику',
};
exports.ParcelStatusEmojis = {
    [ParcelStatus.AWAITING_SHIPMENT]: '📝',
    [ParcelStatus.ACCEPTED_AT_ORIGIN]: '📦',
    [ParcelStatus.IN_TRANSIT]: '🚚',
    [ParcelStatus.ARRIVED_AT_DESTINATION]: '🏙️',
    [ParcelStatus.AT_RECIPIENT_OFFICE]: '📬',
    [ParcelStatus.DELIVERED]: '✅',
    [ParcelStatus.RETURNED_TO_SENDER]: '↩️',
};
exports.ParcelStatusOrder = [
    ParcelStatus.AWAITING_SHIPMENT,
    ParcelStatus.ACCEPTED_AT_ORIGIN,
    ParcelStatus.IN_TRANSIT,
    ParcelStatus.ARRIVED_AT_DESTINATION,
    ParcelStatus.AT_RECIPIENT_OFFICE,
    ParcelStatus.DELIVERED,
];
//# sourceMappingURL=parcel-status.enum.js.map