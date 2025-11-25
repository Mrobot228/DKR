"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTrackingNumber = exports.isValidTrackingNumber = exports.generateTrackingNumber = void 0;
__exportStar(require("./utils/validators"), exports);
var tracking_number_generator_1 = require("./utils/tracking-number.generator");
Object.defineProperty(exports, "generateTrackingNumber", { enumerable: true, get: function () { return tracking_number_generator_1.generateTrackingNumber; } });
Object.defineProperty(exports, "isValidTrackingNumber", { enumerable: true, get: function () { return tracking_number_generator_1.isValidTrackingNumber; } });
Object.defineProperty(exports, "normalizeTrackingNumber", { enumerable: true, get: function () { return tracking_number_generator_1.normalizeTrackingNumber; } });
//# sourceMappingURL=index.js.map