import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Parcel, ParcelStatusHistory } from '../../database/entities';
import { ParcelsService } from './parcels.service';

@Module({
  imports: [TypeOrmModule.forFeature([Parcel, ParcelStatusHistory])],
  providers: [ParcelsService],
  exports: [ParcelsService],
})
export class ParcelsModule {}




