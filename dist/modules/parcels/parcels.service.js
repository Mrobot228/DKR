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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ParcelsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParcelsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
const parcel_status_enum_1 = require("../../constants/parcel-status.enum");
const app_config_1 = require("../../config/app.config");
let ParcelsService = ParcelsService_1 = class ParcelsService {
    constructor(parcelsRepository, historyRepository) {
        this.parcelsRepository = parcelsRepository;
        this.historyRepository = historyRepository;
        this.logger = new common_1.Logger(ParcelsService_1.name);
    }
    async create(dto) {
        const trackingNumber = this.generateTrackingNumber();
        const deliveryType = dto.deliveryType || 'standard';
        const deliveryCost = this.calculateDeliveryCost(dto.senderCity, dto.recipientCity, dto.weight, deliveryType);
        const parcelData = {
            ...dto,
            trackingNumber,
            deliveryCost,
            deliveryType,
            declaredValue: dto.declaredValue || 0,
            currentStatus: parcel_status_enum_1.ParcelStatus.AWAITING_SHIPMENT,
        };
        if (!parcelData.senderOfficeId) {
            delete parcelData.senderOfficeId;
        }
        if (!parcelData.recipientOfficeId) {
            delete parcelData.recipientOfficeId;
        }
        const parcel = this.parcelsRepository.create(parcelData);
        await this.parcelsRepository.save(parcel);
        const savedParcel = await this.parcelsRepository.findOne({
            where: { trackingNumber },
        });
        if (!savedParcel) {
            throw new Error('Помилка збереження посилки');
        }
        await this.addStatusHistory(savedParcel.id, parcel_status_enum_1.ParcelStatus.AWAITING_SHIPMENT, 'Накладна створена');
        this.logger.log(`Створено посилку: ${trackingNumber}`);
        return savedParcel;
    }
    async findByTrackingNumber(trackingNumber) {
        return this.parcelsRepository.findOne({
            where: { trackingNumber },
            relations: ['statusHistory', 'senderOffice', 'recipientOffice', 'sender'],
            order: {
                statusHistory: {
                    timestamp: 'ASC',
                },
            },
        });
    }
    async findByUser(telegramId) {
        return this.parcelsRepository.find({
            where: { senderTelegramId: telegramId },
            relations: ['senderOffice', 'recipientOffice'],
            order: { createdAt: 'DESC' },
        });
    }
    async findByPhone(phone) {
        const normalizedPhone = phone.replace(/[^\d+]/g, '');
        return this.parcelsRepository.find({
            where: [{ senderPhone: normalizedPhone }, { recipientPhone: normalizedPhone }],
            order: { createdAt: 'DESC' },
        });
    }
    async updateStatus(dto) {
        const parcel = await this.findByTrackingNumber(dto.trackingNumber);
        if (!parcel) {
            throw new common_1.NotFoundException('Посилку не знайдено');
        }
        const newStatus = dto.status;
        parcel.currentStatus = newStatus;
        await this.parcelsRepository.save(parcel);
        await this.addStatusHistory(parcel.id, newStatus, dto.comment, dto.location);
        this.logger.log(`Оновлено статус посилки ${dto.trackingNumber}: ${newStatus}`);
        return parcel;
    }
    async addStatusHistory(parcelId, status, comment, location) {
        const history = this.historyRepository.create({
            parcelId,
            status,
            comment,
            location,
        });
        return this.historyRepository.save(history);
    }
    generateTrackingNumber() {
        const timestamp = Date.now().toString();
        const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0');
        const combined = (timestamp + random).slice(-12);
        return `${combined.slice(0, 4)}-${combined.slice(4, 8)}-${combined.slice(8, 12)}`;
    }
    calculateDeliveryCost(fromCity, toCity, weight, deliveryType) {
        const rates = app_config_1.DeliveryRates[deliveryType];
        let cost = rates.basePrice + weight * rates.pricePerKg;
        const distance = this.getCityDistance(fromCity.toLowerCase(), toCity.toLowerCase());
        if (distance > 0) {
            cost += (distance / 100) * app_config_1.DistanceRatePer100Km;
        }
        return Math.round(cost * 100) / 100;
    }
    getDeliveryTime(deliveryType) {
        const rates = app_config_1.DeliveryRates[deliveryType];
        return { min: rates.minDays, max: rates.maxDays };
    }
    getCityDistance(from, to) {
        if (from === to)
            return 0;
        const fromDistances = app_config_1.CityDistances[from];
        if (fromDistances && fromDistances[to]) {
            return fromDistances[to];
        }
        const toDistances = app_config_1.CityDistances[to];
        if (toDistances && toDistances[from]) {
            return toDistances[from];
        }
        return 300;
    }
    async getStatistics() {
        const total = await this.parcelsRepository.count();
        const statusCounts = await this.parcelsRepository
            .createQueryBuilder('parcel')
            .select('parcel.currentStatus', 'status')
            .addSelect('COUNT(*)', 'count')
            .groupBy('parcel.currentStatus')
            .getRawMany();
        const byStatus = {};
        for (const { status, count } of statusCounts) {
            byStatus[status] = parseInt(count, 10);
        }
        return { total, byStatus };
    }
    formatParcelInfo(parcel) {
        const statusLabel = parcel_status_enum_1.ParcelStatusLabels[parcel.currentStatus] || parcel.currentStatus;
        return `📦 *Посилка ${parcel.trackingNumber}*

📤 *Відправник:*
${parcel.senderName}
📞 ${parcel.senderPhone}
📍 ${parcel.senderCity}, ${parcel.senderAddress}

📥 *Отримувач:*
${parcel.recipientName}
📞 ${parcel.recipientPhone}
📍 ${parcel.recipientCity}, ${parcel.recipientAddress}

📋 *Деталі:*
Опис: ${parcel.description}
Вага: ${parcel.weight} кг
Вартість: ${parcel.declaredValue} грн
Доставка: ${parcel.deliveryType === 'express' ? '⚡ Експрес' : '📦 Стандартна'}
Ціна доставки: ${parcel.deliveryCost} грн

📊 *Статус:* ${statusLabel}
📅 Створено: ${parcel.createdAt.toLocaleDateString('uk-UA')}`;
    }
    formatStatusHistory(history) {
        if (!history || history.length === 0) {
            return 'Історія статусів порожня';
        }
        return history
            .map((h) => {
            const date = h.timestamp.toLocaleString('uk-UA');
            const status = parcel_status_enum_1.ParcelStatusLabels[h.status] || h.status;
            const comment = h.comment ? `\n   _${h.comment}_` : '';
            const location = h.location ? ` (${h.location})` : '';
            return `• ${date}${location}\n   ${status}${comment}`;
        })
            .join('\n\n');
    }
};
exports.ParcelsService = ParcelsService;
exports.ParcelsService = ParcelsService = ParcelsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.Parcel)),
    __param(1, (0, typeorm_1.InjectRepository)(entities_1.ParcelStatusHistory)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ParcelsService);
//# sourceMappingURL=parcels.service.js.map