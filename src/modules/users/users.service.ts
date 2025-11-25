import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Створити або оновити користувача
   */
  async createOrUpdate(dto: CreateUserDto): Promise<User> {
    let user = await this.usersRepository.findOne({
      where: { telegramId: dto.telegramId },
    });

    if (user) {
      // Оновлюємо існуючого користувача
      user.username = dto.username ?? user.username;
      user.firstName = dto.firstName ?? user.firstName;
      user.lastName = dto.lastName ?? user.lastName;
      if (dto.phone) {
        user.phone = dto.phone;
      }
    } else {
      // Створюємо нового користувача
      user = this.usersRepository.create(dto);
      this.logger.log(`Створено нового користувача: ${dto.telegramId}`);
    }

    return this.usersRepository.save(user);
  }

  /**
   * Знайти користувача за Telegram ID
   */
  async findByTelegramId(telegramId: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { telegramId },
    });
  }

  /**
   * Знайти користувача за номером телефону
   */
  async findByPhone(phone: string): Promise<User | null> {
    const normalizedPhone = this.normalizePhone(phone);
    return this.usersRepository.findOne({
      where: { phone: normalizedPhone },
    });
  }

  /**
   * Оновити телефон користувача
   */
  async updatePhone(telegramId: number, phone: string): Promise<User | null> {
    const user = await this.findByTelegramId(telegramId);
    if (!user) return null;

    user.phone = this.normalizePhone(phone);
    return this.usersRepository.save(user);
  }

  /**
   * Перевірити чи є користувач адміністратором
   */
  async isAdmin(telegramId: number): Promise<boolean> {
    const user = await this.findByTelegramId(telegramId);
    return user?.isAdmin ?? false;
  }

  /**
   * Отримати загальну кількість користувачів
   */
  async getTotalCount(): Promise<number> {
    return this.usersRepository.count();
  }

  /**
   * Нормалізувати номер телефону
   */
  private normalizePhone(phone: string): string {
    return phone.replace(/[^\d+]/g, '');
  }
}





