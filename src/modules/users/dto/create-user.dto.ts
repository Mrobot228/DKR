import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNumber()
  telegramId: number;

  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}





