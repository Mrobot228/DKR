import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { PostOffice } from './post-office.entity';
import { ParcelStatusHistory } from './parcel-status-history.entity';
import { ParcelStatus } from '../../constants/parcel-status.enum';

@Entity('parcels')
export class Parcel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 14 })
  @Index()
  trackingNumber: string; // формат: XXXX-XXXX-XXXX

  // ========== Відправник ==========
  @ManyToOne(() => User, (user) => user.sentParcels, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'sender_telegram_id' })
  sender: User;

  @Column({ name: 'sender_telegram_id', type: 'bigint' })
  senderTelegramId: number;

  @Column({ length: 255 })
  senderName: string;

  @Column({ length: 20 })
  senderPhone: string;

  @Column({ length: 100 })
  senderCity: string;

  @Column({ length: 255 })
  senderAddress: string;

  @ManyToOne(() => PostOffice, { nullable: true })
  @JoinColumn({ name: 'sender_office_id' })
  senderOffice: PostOffice;

  @Column({ name: 'sender_office_id', nullable: true })
  senderOfficeId: number;

  // ========== Отримувач ==========
  @Column({ length: 255 })
  recipientName: string;

  @Column({ length: 20 })
  recipientPhone: string;

  @Column({ length: 100 })
  recipientCity: string;

  @Column({ length: 255 })
  recipientAddress: string;

  @ManyToOne(() => PostOffice, { nullable: true })
  @JoinColumn({ name: 'recipient_office_id' })
  recipientOffice: PostOffice;

  @Column({ name: 'recipient_office_id', nullable: true })
  recipientOfficeId: number;

  // ========== Дані посилки ==========
  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'real' })
  weight: number;

  @Column({ type: 'real', default: 0 })
  declaredValue: number;

  @Column({ length: 20, default: 'standard' })
  deliveryType: string; // 'standard' | 'express'

  @Column({ type: 'real', default: 0 })
  deliveryCost: number;

  // ========== Статус ==========
  @Column({
    type: 'varchar',
    length: 50,
    default: ParcelStatus.AWAITING_SHIPMENT,
  })
  @Index()
  currentStatus: ParcelStatus;

  // ========== Історія ==========
  @OneToMany(() => ParcelStatusHistory, (history) => history.parcel, {
    cascade: true,
    eager: false,
  })
  statusHistory: ParcelStatusHistory[];

  // ========== Часові мітки ==========
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Форматований номер відстеження
   */
  get formattedTrackingNumber(): string {
    return this.trackingNumber;
  }

  /**
   * Чи є посилка активною (не доставлена і не повернена)
   */
  get isActive(): boolean {
    return (
      this.currentStatus !== ParcelStatus.DELIVERED &&
      this.currentStatus !== ParcelStatus.RETURNED_TO_SENDER
    );
  }
}
