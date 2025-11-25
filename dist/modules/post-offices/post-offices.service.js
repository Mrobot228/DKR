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
var PostOfficesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostOfficesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
let PostOfficesService = PostOfficesService_1 = class PostOfficesService {
    constructor(postOfficesRepository) {
        this.postOfficesRepository = postOfficesRepository;
        this.logger = new common_1.Logger(PostOfficesService_1.name);
    }
    async create(dto) {
        const office = this.postOfficesRepository.create(dto);
        return this.postOfficesRepository.save(office);
    }
    async findByNumber(officeNumber) {
        return this.postOfficesRepository.findOne({
            where: { officeNumber, isActive: true },
        });
    }
    async findById(id) {
        return this.postOfficesRepository.findOne({
            where: { id, isActive: true },
        });
    }
    async findByCity(city) {
        return this.postOfficesRepository.find({
            where: {
                city: (0, typeorm_2.ILike)(`%${city}%`),
                isActive: true,
            },
            order: { officeNumber: 'ASC' },
        });
    }
    async findAll() {
        return this.postOfficesRepository.find({
            where: { isActive: true },
            order: { city: 'ASC', officeNumber: 'ASC' },
        });
    }
    async findNearest(latitude, longitude, radiusKm = 5, limit = 3) {
        const allOffices = await this.findAll();
        const officesWithDistance = allOffices
            .map((office) => ({
            office: {
                id: office.id,
                officeNumber: office.officeNumber,
                city: office.city,
                address: office.address,
                latitude: Number(office.latitude),
                longitude: Number(office.longitude),
                workingHours: office.workingHours,
                phone: office.phone,
                googleMapsLink: `https://www.google.com/maps?q=${office.latitude},${office.longitude}`,
            },
            distance: this.calculateDistance(latitude, longitude, Number(office.latitude), Number(office.longitude)),
        }))
            .filter((item) => item.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, limit);
        return officesWithDistance;
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
                Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 100) / 100;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    async getTotalCount() {
        return this.postOfficesRepository.count({
            where: { isActive: true },
        });
    }
    async seedTestData() {
        const count = await this.getTotalCount();
        if (count > 0) {
            this.logger.log('Відділення вже існують, пропускаємо заповнення');
            return;
        }
        const testOffices = [
            {
                officeNumber: '1',
                city: 'Київ',
                address: 'вул. Хрещатик, 1',
                latitude: 50.4501,
                longitude: 30.5234,
                workingHours: '09:00-20:00',
                phone: '+380441234567',
            },
            {
                officeNumber: '2',
                city: 'Київ',
                address: 'вул. Велика Васильківська, 100',
                latitude: 50.4205,
                longitude: 30.5167,
                workingHours: '09:00-19:00',
                phone: '+380441234568',
            },
            {
                officeNumber: '3',
                city: 'Київ',
                address: 'просп. Перемоги, 50',
                latitude: 50.4567,
                longitude: 30.4423,
                workingHours: '08:00-21:00',
                phone: '+380441234569',
            },
            {
                officeNumber: '4',
                city: 'Львів',
                address: 'пл. Ринок, 1',
                latitude: 49.8419,
                longitude: 24.0316,
                workingHours: '09:00-18:00',
                phone: '+380321234567',
            },
            {
                officeNumber: '5',
                city: 'Львів',
                address: 'просп. Свободи, 28',
                latitude: 49.8427,
                longitude: 24.0268,
                workingHours: '09:00-19:00',
                phone: '+380321234568',
            },
            {
                officeNumber: '6',
                city: 'Одеса',
                address: 'Дерибасівська, 10',
                latitude: 46.4843,
                longitude: 30.7324,
                workingHours: '09:00-20:00',
                phone: '+380481234567',
            },
            {
                officeNumber: '7',
                city: 'Одеса',
                address: 'просп. Шевченка, 5',
                latitude: 46.4693,
                longitude: 30.7325,
                workingHours: '08:00-19:00',
                phone: '+380481234568',
            },
            {
                officeNumber: '8',
                city: 'Харків',
                address: 'пл. Свободи, 1',
                latitude: 49.9935,
                longitude: 36.2304,
                workingHours: '09:00-18:00',
                phone: '+380571234567',
            },
            {
                officeNumber: '9',
                city: 'Харків',
                address: 'вул. Сумська, 25',
                latitude: 50.0007,
                longitude: 36.2292,
                workingHours: '09:00-20:00',
                phone: '+380571234568',
            },
            {
                officeNumber: '10',
                city: 'Дніпро',
                address: 'просп. Дмитра Яворницького, 50',
                latitude: 48.4647,
                longitude: 35.0462,
                workingHours: '09:00-19:00',
                phone: '+380561234567',
            },
        ];
        for (const office of testOffices) {
            await this.create(office);
        }
        this.logger.log(`Створено ${testOffices.length} тестових відділень`);
    }
};
exports.PostOfficesService = PostOfficesService;
exports.PostOfficesService = PostOfficesService = PostOfficesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.PostOffice)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PostOfficesService);
//# sourceMappingURL=post-offices.service.js.map