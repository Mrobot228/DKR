import { ConfigService } from '@nestjs/config';
export interface Coordinates {
    lat: number;
    lng: number;
}
export interface GeocodingResult {
    coordinates: Coordinates;
    formattedAddress: string;
}
export interface PostOfficeResult {
    name: string;
    address: string;
    lat: number;
    lng: number;
    distance: number;
    type: string;
    openingHours?: string;
    phone?: string;
}
export declare class MapsService {
    private configService;
    private readonly logger;
    private readonly apiKey;
    constructor(configService: ConfigService);
    geocodeAddress(address: string): Promise<GeocodingResult | null>;
    findRealPostOffices(lat: number, lng: number, radiusMeters?: number, limit?: number): Promise<PostOfficeResult[]>;
    private removeDuplicates;
    searchPostOfficesNominatim(lat: number, lng: number, radiusKm?: number): Promise<PostOfficeResult[]>;
    findNearestPostOffices(lat: number, lng: number, radiusKm?: number, limit?: number): Promise<PostOfficeResult[]>;
    getGoogleMapsLink(lat: number, lng: number): string;
    getDirectionsLink(fromLat: number, fromLng: number, toLat: number, toLng: number): string;
    calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
    private deg2rad;
    formatDistance(distanceKm: number): string;
    getOfficeEmoji(type: string): string;
    getOfficeTypeName(type: string): string;
}
