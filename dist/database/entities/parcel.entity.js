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
exports.Parcel = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const post_office_entity_1 = require("./post-office.entity");
const parcel_status_history_entity_1 = require("./parcel-status-history.entity");
const parcel_status_enum_1 = require("../../constants/parcel-status.enum");
let Parcel = class Parcel {
    get formattedTrackingNumber() {
        return this.trackingNumber;
    }
    get isActive() {
        return (this.currentStatus !== parcel_status_enum_1.ParcelStatus.DELIVERED &&
            this.currentStatus !== parcel_status_enum_1.ParcelStatus.RETURNED_TO_SENDER);
    }
};
exports.Parcel = Parcel;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Parcel.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 14 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Parcel.prototype, "trackingNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.sentParcels, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'sender_telegram_id' }),
    __metadata("design:type", user_entity_1.User)
], Parcel.prototype, "sender", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_telegram_id', type: 'bigint' }),
    __metadata("design:type", Number)
], Parcel.prototype, "senderTelegramId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Parcel.prototype, "senderName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], Parcel.prototype, "senderPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Parcel.prototype, "senderCity", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Parcel.prototype, "senderAddress", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => post_office_entity_1.PostOffice, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'sender_office_id' }),
    __metadata("design:type", post_office_entity_1.PostOffice)
], Parcel.prototype, "senderOffice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sender_office_id', nullable: true }),
    __metadata("design:type", Number)
], Parcel.prototype, "senderOfficeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Parcel.prototype, "recipientName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], Parcel.prototype, "recipientPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Parcel.prototype, "recipientCity", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Parcel.prototype, "recipientAddress", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => post_office_entity_1.PostOffice, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'recipient_office_id' }),
    __metadata("design:type", post_office_entity_1.PostOffice)
], Parcel.prototype, "recipientOffice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'recipient_office_id', nullable: true }),
    __metadata("design:type", Number)
], Parcel.prototype, "recipientOfficeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Parcel.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'real' }),
    __metadata("design:type", Number)
], Parcel.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'real', default: 0 }),
    __metadata("design:type", Number)
], Parcel.prototype, "declaredValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, default: 'standard' }),
    __metadata("design:type", String)
], Parcel.prototype, "deliveryType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'real', default: 0 }),
    __metadata("design:type", Number)
], Parcel.prototype, "deliveryCost", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 50,
        default: parcel_status_enum_1.ParcelStatus.AWAITING_SHIPMENT,
    }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], Parcel.prototype, "currentStatus", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => parcel_status_history_entity_1.ParcelStatusHistory, (history) => history.parcel, {
        cascade: true,
        eager: false,
    }),
    __metadata("design:type", Array)
], Parcel.prototype, "statusHistory", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Parcel.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Parcel.prototype, "updatedAt", void 0);
exports.Parcel = Parcel = __decorate([
    (0, typeorm_1.Entity)('parcels')
], Parcel);
//# sourceMappingURL=parcel.entity.js.map