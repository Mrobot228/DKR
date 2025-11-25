import { Repository } from 'typeorm';
import { Parcel, ParcelStatusHistory } from '../../database/entities';
import { CreateParcelDto, UpdateParcelStatusDto } from './dto/create-parcel.dto';
export declare class ParcelsService {
    private parcelsRepository;
    private historyRepository;
    private readonly logger;
    constructor(parcelsRepository: Repository<Parcel>, historyRepository: Repository<ParcelStatusHistory>);
    create(dto: CreateParcelDto): Promise<Parcel>;
    findByTrackingNumber(trackingNumber: string): Promise<Parcel | null>;
    findByUser(telegramId: number): Promise<Parcel[]>;
    findByPhone(phone: string): Promise<Parcel[]>;
    updateStatus(dto: UpdateParcelStatusDto): Promise<Parcel>;
    private addStatusHistory;
    private generateTrackingNumber;
    calculateDeliveryCost(fromCity: string, toCity: string, weight: number, deliveryType: 'standard' | 'express'): number;
    getDeliveryTime(deliveryType: 'standard' | 'express'): {
        min: number;
        max: number;
    };
    private getCityDistance;
    getStatistics(): Promise<{
        total: number;
        byStatus: Record<string, number>;
    }>;
    formatParcelInfo(parcel: Parcel): string;
    formatStatusHistory(history: ParcelStatusHistory[]): string;
}
