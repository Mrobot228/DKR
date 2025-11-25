import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('post_offices')
export class PostOffice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 20 })
  @Index()
  officeNumber: string;

  @Column({ length: 100 })
  @Index()
  city: string;

  @Column({ length: 255 })
  address: string;

  @Column({ type: 'real' })
  latitude: number;

  @Column({ type: 'real' })
  longitude: number;

  @Column({ nullable: true, length: 100 })
  workingHours: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /**
   * Отримати повну адресу відділення
   */
  get fullAddress(): string {
    return `${this.city}, ${this.address}`;
  }

  /**
   * Отримати посилання на Google Maps
   */
  get googleMapsLink(): string {
    return `https://www.google.com/maps?q=${this.latitude},${this.longitude}`;
  }
}
