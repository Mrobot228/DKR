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
exports.PostOffice = void 0;
const typeorm_1 = require("typeorm");
let PostOffice = class PostOffice {
    get fullAddress() {
        return `${this.city}, ${this.address}`;
    }
    get googleMapsLink() {
        return `https://www.google.com/maps?q=${this.latitude},${this.longitude}`;
    }
};
exports.PostOffice = PostOffice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PostOffice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 20 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PostOffice.prototype, "officeNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PostOffice.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], PostOffice.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'real' }),
    __metadata("design:type", Number)
], PostOffice.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'real' }),
    __metadata("design:type", Number)
], PostOffice.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 100 }),
    __metadata("design:type", String)
], PostOffice.prototype, "workingHours", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, length: 20 }),
    __metadata("design:type", String)
], PostOffice.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], PostOffice.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PostOffice.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PostOffice.prototype, "updatedAt", void 0);
exports.PostOffice = PostOffice = __decorate([
    (0, typeorm_1.Entity)('post_offices')
], PostOffice);
//# sourceMappingURL=post-office.entity.js.map