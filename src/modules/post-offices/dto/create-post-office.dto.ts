import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreatePostOfficeDto {
  @IsString()
  officeNumber: string;

  @IsString()
  city: string;

  @IsString()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  workingHours?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class NearbyOfficeDto {
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
  distance: number; // в км
}





