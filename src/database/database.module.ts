import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, PostOffice, Parcel, ParcelStatusHistory } from './entities';

@Module({
  imports: [TypeOrmModule.forFeature([User, PostOffice, Parcel, ParcelStatusHistory])],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}





