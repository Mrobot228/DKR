"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTrackingNumber = exports.isValidTrackingNumber = exports.formatTrackingNumber = exports.generateTrackingNumber = void 0;
const generateTrackingNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');
    const combined = (timestamp + random).slice(-12);
    return (0, exports.formatTrackingNumber)(combined);
};
exports.generateTrackingNumber = generateTrackingNumber;
const formatTrackingNumber = (digits) => {
    const cleanDigits = digits.replace(/\D/g, '').slice(-12).padStart(12, '0');
    return `${cleanDigits.slice(0, 4)}-${cleanDigits.slice(4, 8)}-${cleanDigits.slice(8, 12)}`;
};
exports.formatTrackingNumber = formatTrackingNumber;
const isValidTrackingNumber = (input) => {
    const digits = input.replace(/\D/g, '');
    return digits.length === 12;
};
exports.isValidTrackingNumber = isValidTrackingNumber;
const normalizeTrackingNumber = (input) => {
    const digits = input.replace(/\D/g, '');
    if (digits.length !== 12)
        return null;
    return (0, exports.formatTrackingNumber)(digits);
};
exports.normalizeTrackingNumber = normalizeTrackingNumber;
//# sourceMappingURL=tracking-number.generator.js.map