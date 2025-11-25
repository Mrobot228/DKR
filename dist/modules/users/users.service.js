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
var UsersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const entities_1 = require("../../database/entities");
let UsersService = UsersService_1 = class UsersService {
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
        this.logger = new common_1.Logger(UsersService_1.name);
    }
    async createOrUpdate(dto) {
        let user = await this.usersRepository.findOne({
            where: { telegramId: dto.telegramId },
        });
        if (user) {
            user.username = dto.username ?? user.username;
            user.firstName = dto.firstName ?? user.firstName;
            user.lastName = dto.lastName ?? user.lastName;
            if (dto.phone) {
                user.phone = dto.phone;
            }
        }
        else {
            user = this.usersRepository.create(dto);
            this.logger.log(`Створено нового користувача: ${dto.telegramId}`);
        }
        return this.usersRepository.save(user);
    }
    async findByTelegramId(telegramId) {
        return this.usersRepository.findOne({
            where: { telegramId },
        });
    }
    async findByPhone(phone) {
        const normalizedPhone = this.normalizePhone(phone);
        return this.usersRepository.findOne({
            where: { phone: normalizedPhone },
        });
    }
    async updatePhone(telegramId, phone) {
        const user = await this.findByTelegramId(telegramId);
        if (!user)
            return null;
        user.phone = this.normalizePhone(phone);
        return this.usersRepository.save(user);
    }
    async isAdmin(telegramId) {
        const user = await this.findByTelegramId(telegramId);
        return user?.isAdmin ?? false;
    }
    async getTotalCount() {
        return this.usersRepository.count();
    }
    normalizePhone(phone) {
        return phone.replace(/[^\d+]/g, '');
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = UsersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(entities_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map