"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelStatusHistory = void 0;
const typeorm_1 = require("typeorm");
const parcel_entity_1 = require("./parcel.entity");
const parcel_status_enum_1 = require("../../constants/parcel-status.enum");
let ParcelStatusHistory = class ParcelStatusHistory {
};
exports.ParcelStatusHistory = ParcelStatusHistory;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ParcelStatusHistory.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => parcel_entity_1.Parcel, (parcel) => parcel.statusHistory, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'parcel_id' }),
    __metadata("design:type", parcel_entity_1.Parcel)
], ParcelStatusHistory.prototype, "parcel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'parcel_id' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", Number)
], ParcelStatusHistory.prototype, "parcelId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
    }),
    __metadata("design:type", String)
], ParcelStatusHistory.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ParcelStatusHistory.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], ParcelStatusHistory.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ParcelStatusHistory.prototype, "timestamp", void 0);
exports.ParcelStatusHistory = ParcelStatusHistory = __decorate([
    (0, typeorm_1.Entity)('parcel_status_history')
], ParcelStatusHistory);
//# sourceMappingURL=parcel-status-history.entity.js.map