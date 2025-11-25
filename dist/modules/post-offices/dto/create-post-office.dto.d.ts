export declare class CreatePostOfficeDto {
    officeNumber: string;
    city: string;
    address: string;
    latitude: number;
    longitude: number;
    workingHours?: string;
    phone?: string;
    isActive?: boolean;
}
export declare class NearbyOfficeDto {
    office: {
        id: number;
        officeNumber: string;
        city: string;
        address: string;
        latitude: number;
        longitude: number;
        workingHours: string;
        phone: string;
        googleMapsLink: string;
    };
    distance: number;
}
