export declare class CreateParcelDto {
    senderTelegramId: number;
    senderName: string;
    senderPhone: string;
    senderCity: string;
    senderAddress: string;
    senderOfficeId?: number;
    recipientName: string;
    recipientPhone: string;
    recipientCity: string;
    recipientAddress: string;
    recipientOfficeId?: number;
    description: string;
    weight: number;
    declaredValue?: number;
    deliveryType?: 'standard' | 'express';
}
export declare class UpdateParcelStatusDto {
    trackingNumber: string;
    status: string;
    comment?: string;
    location?: string;
}
