import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateParcelDto {
  @IsNumber()
  senderTelegramId: number;

  @IsString()
  senderName: string;

  @IsString()
  senderPhone: string;

  @IsString()
  senderCity: string;

  @IsString()
  senderAddress: string;

  @IsOptional()
  @IsNumber()
  senderOfficeId?: number;

  @IsString()
  recipientName: string;

  @IsString()
  recipientPhone: string;

  @IsString()
  recipientCity: string;

  @IsString()
  recipientAddress: string;

  @IsOptional()
  @IsNumber()
  recipientOfficeId?: number;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0.01)
  @Max(1000)
  weight: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  declaredValue?: number;

  @IsOptional()
  @IsString()
  deliveryType?: 'standard' | 'express';
}

export class UpdateParcelStatusDto {
  @IsString()
  trackingNumber: string;

  @IsString()
  status: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
