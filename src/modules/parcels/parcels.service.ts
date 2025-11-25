import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parcel, ParcelStatusHistory } from '../../database/entities';
import { ParcelStatus, ParcelStatusLabels } from '../../constants/parcel-status.enum';
import { CreateParcelDto, UpdateParcelStatusDto } from './dto/create-parcel.dto';
import { DeliveryRates, CityDistances, DistanceRatePer100Km } from '../../config/app.config';

@Injectable()
export class ParcelsService {
  private readonly logger = new Logger(ParcelsService.name);

  constructor(
    @InjectRepository(Parcel)
    private parcelsRepository: Repository<Parcel>,
    @InjectRepository(ParcelStatusHistory)
    private historyRepository: Repository<ParcelStatusHistory>,
  ) {}

  /**
   * Створити нову посилку
   */
  async create(dto: CreateParcelDto): Promise<Parcel> {
    const trackingNumber = this.generateTrackingNumber();
    const deliveryType = dto.deliveryType || 'standard';

    // Розраховуємо вартість доставки
    const deliveryCost = this.calculateDeliveryCost(
      dto.senderCity,
      dto.recipientCity,
      dto.weight,
      deliveryType,
    );

    // Видаляємо undefined значення для office_id
    const parcelData: any = {
      ...dto,
      trackingNumber,
      deliveryCost,
      deliveryType,
      declaredValue: dto.declaredValue || 0,
      currentStatus: ParcelStatus.AWAITING_SHIPMENT,
    };

    // Видаляємо office_id якщо вони undefined
    if (!parcelData.senderOfficeId) {
      delete parcelData.senderOfficeId;
    }
    if (!parcelData.recipientOfficeId) {
      delete parcelData.recipientOfficeId;
    }

    const parcel = this.parcelsRepository.create(parcelData);

    // Зберігаємо посилку
    await this.parcelsRepository.save(parcel);
    
    // Отримуємо збережену посилку з бази
    const savedParcel = await this.parcelsRepository.findOne({
      where: { trackingNumber },
    });

    if (!savedParcel) {
      throw new Error('Помилка збереження посилки');
    }

    // Створюємо перший запис в історії
    await this.addStatusHistory(
      savedParcel.id,
      ParcelStatus.AWAITING_SHIPMENT,
      'Накладна створена',
    );

    this.logger.log(`Створено посилку: ${trackingNumber}`);
    return savedParcel;
  }

  /**
   * Знайти посилку за номером відстеження
   */
  async findByTrackingNumber(trackingNumber: string): Promise<Parcel | null> {
    return this.parcelsRepository.findOne({
      where: { trackingNumber },
      relations: ['statusHistory', 'senderOffice', 'recipientOffice', 'sender'],
      order: {
        statusHistory: {
          timestamp: 'ASC',
        },
      },
    });
  }

  /**
   * Отримати всі посилки користувача
   */
  async findByUser(telegramId: number): Promise<Parcel[]> {
    return this.parcelsRepository.find({
      where: { senderTelegramId: telegramId },
      relations: ['senderOffice', 'recipientOffice'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Знайти посилки за номером телефону
   */
  async findByPhone(phone: string): Promise<Parcel[]> {
    const normalizedPhone = phone.replace(/[^\d+]/g, '');
    return this.parcelsRepository.find({
      where: [{ senderPhone: normalizedPhone }, { recipientPhone: normalizedPhone }],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Оновити статус посилки
   */
  async updateStatus(dto: UpdateParcelStatusDto): Promise<Parcel> {
    const parcel = await this.findByTrackingNumber(dto.trackingNumber);

    if (!parcel) {
      throw new NotFoundException('Посилку не знайдено');
    }

    const newStatus = dto.status as ParcelStatus;
    parcel.currentStatus = newStatus;
    await this.parcelsRepository.save(parcel);

    await this.addStatusHistory(parcel.id, newStatus, dto.comment, dto.location);

    this.logger.log(`Оновлено статус посилки ${dto.trackingNumber}: ${newStatus}`);
    return parcel;
  }

  /**
   * Додати запис в історію статусів
   */
  private async addStatusHistory(
    parcelId: number,
    status: ParcelStatus,
    comment?: string,
    location?: string,
  ): Promise<ParcelStatusHistory> {
    const history = this.historyRepository.create({
      parcelId,
      status,
      comment,
      location,
    });
    return this.historyRepository.save(history);
  }

  /**
   * Генерувати унікальний номер відстеження
   */
  private generateTrackingNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    const combined = (timestamp + random).slice(-12);

    return `${combined.slice(0, 4)}-${combined.slice(4, 8)}-${combined.slice(8, 12)}`;
  }

  /**
   * Розрахувати вартість доставки
   */
  calculateDeliveryCost(
    fromCity: string,
    toCity: string,
    weight: number,
    deliveryType: 'standard' | 'express',
  ): number {
    const rates = DeliveryRates[deliveryType];
    let cost = rates.basePrice + weight * rates.pricePerKg;

    // Додаємо вартість за відстань
    const distance = this.getCityDistance(fromCity.toLowerCase(), toCity.toLowerCase());
    if (distance > 0) {
      cost += (distance / 100) * DistanceRatePer100Km;
    }

    return Math.round(cost * 100) / 100;
  }

  /**
   * Отримати час доставки
   */
  getDeliveryTime(deliveryType: 'standard' | 'express'): { min: number; max: number } {
    const rates = DeliveryRates[deliveryType];
    return { min: rates.minDays, max: rates.maxDays };
  }

  /**
   * Отримати відстань між містами
   */
  private getCityDistance(from: string, to: string): number {
    if (from === to) return 0;

    const fromDistances = CityDistances[from];
    if (fromDistances && fromDistances[to]) {
      return fromDistances[to];
    }

    const toDistances = CityDistances[to];
    if (toDistances && toDistances[from]) {
      return toDistances[from];
    }

    // Якщо відстань не знайдено, повертаємо середнє значення
    return 300;
  }

  /**
   * Отримати статистику
   */
  async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
  }> {
    const total = await this.parcelsRepository.count();

    const statusCounts = await this.parcelsRepository
      .createQueryBuilder('parcel')
      .select('parcel.currentStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('parcel.currentStatus')
      .getRawMany();

    const byStatus: Record<string, number> = {};
    for (const { status, count } of statusCounts) {
      byStatus[status] = parseInt(count, 10);
    }

    return { total, byStatus };
  }

  /**
   * Форматувати інформацію про посилку для відображення
   */
  formatParcelInfo(parcel: Parcel): string {
    const statusLabel = ParcelStatusLabels[parcel.currentStatus] || parcel.currentStatus;

    return `📦 *Посилка ${parcel.trackingNumber}*

📤 *Відправник:*
${parcel.senderName}
📞 ${parcel.senderPhone}
📍 ${parcel.senderCity}, ${parcel.senderAddress}

📥 *Отримувач:*
${parcel.recipientName}
📞 ${parcel.recipientPhone}
📍 ${parcel.recipientCity}, ${parcel.recipientAddress}

📋 *Деталі:*
Опис: ${parcel.description}
Вага: ${parcel.weight} кг
Вартість: ${parcel.declaredValue} грн
Доставка: ${parcel.deliveryType === 'express' ? '⚡ Експрес' : '📦 Стандартна'}
Ціна доставки: ${parcel.deliveryCost} грн

📊 *Статус:* ${statusLabel}
📅 Створено: ${parcel.createdAt.toLocaleDateString('uk-UA')}`;
  }

  /**
   * Форматувати історію статусів
   */
  formatStatusHistory(history: ParcelStatusHistory[]): string {
    if (!history || history.length === 0) {
      return 'Історія статусів порожня';
    }

    return history
      .map((h) => {
        const date = h.timestamp.toLocaleString('uk-UA');
        const status = ParcelStatusLabels[h.status] || h.status;
        const comment = h.comment ? `\n   _${h.comment}_` : '';
        const location = h.location ? ` (${h.location})` : '';
        return `• ${date}${location}\n   ${status}${comment}`;
      })
      .join('\n\n');
  }
}


