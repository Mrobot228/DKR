import { Parcel } from './parcel.entity';
export declare class User {
    telegramId: number;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    language: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
    sentParcels: Parcel[];
    get fullName(): string;
}
