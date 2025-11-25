import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Parcel } from './parcel.entity';

@Entity('users')
export class User {
  @PrimaryColumn({ type: 'bigint' })
  telegramId: number;

  @Column({ nullable: true, length: 100 })
  username: string;

  @Column({ nullable: true, length: 100 })
  firstName: string;

  @Column({ nullable: true, length: 100 })
  lastName: string;

  @Column({ nullable: true, length: 20 })
  phone: string;

  @Column({ default: 'uk', length: 5 })
  language: string;

  @Column({ default: false })
  isAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Parcel, (parcel) => parcel.sender)
  sentParcels: Parcel[];

  /**
   * Отримати повне ім'я користувача
   */
  get fullName(): string {
    const parts = [this.firstName, this.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : this.username || `User ${this.telegramId}`;
  }
}




