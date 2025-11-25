import { Repository } from 'typeorm';
import { User } from '../../database/entities';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private usersRepository;
    private readonly logger;
    constructor(usersRepository: Repository<User>);
    createOrUpdate(dto: CreateUserDto): Promise<User>;
    findByTelegramId(telegramId: number): Promise<User | null>;
    findByPhone(phone: string): Promise<User | null>;
    updatePhone(telegramId: number, phone: string): Promise<User | null>;
    isAdmin(telegramId: number): Promise<boolean>;
    getTotalCount(): Promise<number>;
    private normalizePhone;
}
