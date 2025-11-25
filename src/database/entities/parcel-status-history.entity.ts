import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Parcel } from './parcel.entity';
import { ParcelStatus } from '../../constants/parcel-status.enum';

@Entity('parcel_status_history')
export class ParcelStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Parcel, (parcel) => parcel.statusHistory, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parcel_id' })
  parcel: Parcel;

  @Column({ name: 'parcel_id' })
  @Index()
  parcelId: number;

  @Column({
    type: 'varchar',
    length: 50,
  })
  status: ParcelStatus;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ nullable: true, length: 100 })
  location: string;

  @CreateDateColumn()
  timestamp: Date;
}
