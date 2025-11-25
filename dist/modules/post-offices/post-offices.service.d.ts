import { Repository } from 'typeorm';
import { PostOffice } from '../../database/entities';
import { CreatePostOfficeDto, NearbyOfficeDto } from './dto/create-post-office.dto';
export declare class PostOfficesService {
    private postOfficesRepository;
    private readonly logger;
    constructor(postOfficesRepository: Repository<PostOffice>);
    create(dto: CreatePostOfficeDto): Promise<PostOffice>;
    findByNumber(officeNumber: string): Promise<PostOffice | null>;
    findById(id: number): Promise<PostOffice | null>;
    findByCity(city: string): Promise<PostOffice[]>;
    findAll(): Promise<PostOffice[]>;
    findNearest(latitude: number, longitude: number, radiusKm?: number, limit?: number): Promise<NearbyOfficeDto[]>;
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
    private deg2rad;
    getTotalCount(): Promise<number>;
    seedTestData(): Promise<void>;
}
