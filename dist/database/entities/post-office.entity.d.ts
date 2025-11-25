export declare class PostOffice {
    id: number;
    officeNumber: string;
    city: string;
    address: string;
    latitude: number;
    longitude: number;
    workingHours: string;
    phone: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    get fullAddress(): string;
    get googleMapsLink(): string;
}
