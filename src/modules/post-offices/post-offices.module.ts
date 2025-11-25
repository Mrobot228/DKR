import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostOffice } from '../../database/entities';
import { PostOfficesService } from './post-offices.service';

@Module({
  imports: [TypeOrmModule.forFeature([PostOffice])],
  providers: [PostOfficesService],
  exports: [PostOfficesService],
})
export class PostOfficesModule {}




