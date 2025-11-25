"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMoney = exports.formatDateTime = exports.formatDate = exports.validateDeclaredValue = exports.validateWeight = exports.formatTrackingNumber = exports.validateTrackingNumber = exports.normalizePhone = exports.validatePhone = void 0;
const validatePhone = (phone) => {
    const normalized = phone.replace(/[\s\-\(\)]/g, '');
    return /^(\+?380|0)\d{9}$/.test(normalized);
};
exports.validatePhone = validatePhone;
const normalizePhone = (phone) => {
    let normalized = phone.replace(/[\s\-\(\)]/g, '');
    if (normalized.startsWith('0')) {
        normalized = '+38' + normalized;
    }
    else if (!normalized.startsWith('+')) {
        normalized = '+' + normalized;
    }
    return normalized;
};
exports.normalizePhone = normalizePhone;
const validateTrackingNumber = (number) => {
    const digits = number.replace(/\D/g, '');
    return digits.length === 12;
};
exports.validateTrackingNumber = validateTrackingNumber;
const formatTrackingNumber = (number) => {
    const digits = number.replace(/\D/g, '');
    if (digits.length !== 12)
        return number;
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}`;
};
exports.formatTrackingNumber = formatTrackingNumber;
const validateWeight = (weight) => {
    return !isNaN(weight) && weight > 0 && weight <= 1000;
};
exports.validateWeight = validateWeight;
const validateDeclaredValue = (value) => {
    return !isNaN(value) && value >= 0;
};
exports.validateDeclaredValue = validateDeclaredValue;
const formatDate = (date) => {
    return date.toLocaleDateString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};
exports.formatDate = formatDate;
const formatDateTime = (date) => {
    return date.toLocaleString('uk-UA', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
exports.formatDateTime = formatDateTime;
const formatMoney = (amount) => {
    return new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: 'UAH',
        minimumFractionDigits: 2,
    }).format(amount);
};
exports.formatMoney = formatMoney;
//# sourceMappingURL=validators.js.map