import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { PostOffice } from '../../database/entities';
import { CreatePostOfficeDto, NearbyOfficeDto } from './dto/create-post-office.dto';

@Injectable()
export class PostOfficesService {
  private readonly logger = new Logger(PostOfficesService.name);

  constructor(
    @InjectRepository(PostOffice)
    private postOfficesRepository: Repository<PostOffice>,
  ) {}

  /**
   * Створити нове відділення
   */
  async create(dto: CreatePostOfficeDto): Promise<PostOffice> {
    const office = this.postOfficesRepository.create(dto);
    return this.postOfficesRepository.save(office);
  }

  /**
   * Знайти відділення за номером
   */
  async findByNumber(officeNumber: string): Promise<PostOffice | null> {
    return this.postOfficesRepository.findOne({
      where: { officeNumber, isActive: true },
    });
  }

  /**
   * Знайти відділення за ID
   */
  async findById(id: number): Promise<PostOffice | null> {
    return this.postOfficesRepository.findOne({
      where: { id, isActive: true },
    });
  }

  /**
   * Отримати всі відділення в місті
   */
  async findByCity(city: string): Promise<PostOffice[]> {
    return this.postOfficesRepository.find({
      where: {
        city: ILike(`%${city}%`),
        isActive: true,
      },
      order: { officeNumber: 'ASC' },
    });
  }

  /**
   * Отримати всі активні відділення
   */
  async findAll(): Promise<PostOffice[]> {
    return this.postOfficesRepository.find({
      where: { isActive: true },
      order: { city: 'ASC', officeNumber: 'ASC' },
    });
  }

  /**
   * Знайти найближчі відділення до координат
   */
  async findNearest(
    latitude: number,
    longitude: number,
    radiusKm: number = 5,
    limit: number = 3,
  ): Promise<NearbyOfficeDto[]> {
    const allOffices = await this.findAll();

    const officesWithDistance = allOffices
      .map((office) => ({
        office: {
          id: office.id,
          officeNumber: office.officeNumber,
          city: office.city,
          address: office.address,
          latitude: Number(office.latitude),
          longitude: Number(office.longitude),
          workingHours: office.workingHours,
          phone: office.phone,
          googleMapsLink: `https://www.google.com/maps?q=${office.latitude},${office.longitude}`,
        },
        distance: this.calculateDistance(
          latitude,
          longitude,
          Number(office.latitude),
          Number(office.longitude),
        ),
      }))
      .filter((item) => item.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);

    return officesWithDistance;
  }

  /**
   * Розрахувати відстань між двома точками (формула гаверсинуса)
   */
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Радіус Землі в км
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) *
        Math.cos(this.deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 100) / 100; // Округлення до 2 знаків
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Отримати загальну кількість відділень
   */
  async getTotalCount(): Promise<number> {
    return this.postOfficesRepository.count({
      where: { isActive: true },
    });
  }

  /**
   * Заповнити тестовими даними (для розробки)
   */
  async seedTestData(): Promise<void> {
    const count = await this.getTotalCount();
    if (count > 0) {
      this.logger.log('Відділення вже існують, пропускаємо заповнення');
      return;
    }

    const testOffices: CreatePostOfficeDto[] = [
      {
        officeNumber: '1',
        city: 'Київ',
        address: 'вул. Хрещатик, 1',
        latitude: 50.4501,
        longitude: 30.5234,
        workingHours: '09:00-20:00',
        phone: '+380441234567',
      },
      {
        officeNumber: '2',
        city: 'Київ',
        address: 'вул. Велика Васильківська, 100',
        latitude: 50.4205,
        longitude: 30.5167,
        workingHours: '09:00-19:00',
        phone: '+380441234568',
      },
      {
        officeNumber: '3',
        city: 'Київ',
        address: 'просп. Перемоги, 50',
        latitude: 50.4567,
        longitude: 30.4423,
        workingHours: '08:00-21:00',
        phone: '+380441234569',
      },
      {
        officeNumber: '4',
        city: 'Львів',
        address: 'пл. Ринок, 1',
        latitude: 49.8419,
        longitude: 24.0316,
        workingHours: '09:00-18:00',
        phone: '+380321234567',
      },
      {
        officeNumber: '5',
        city: 'Львів',
        address: 'просп. Свободи, 28',
        latitude: 49.8427,
        longitude: 24.0268,
        workingHours: '09:00-19:00',
        phone: '+380321234568',
      },
      {
        officeNumber: '6',
        city: 'Одеса',
        address: 'Дерибасівська, 10',
        latitude: 46.4843,
        longitude: 30.7324,
        workingHours: '09:00-20:00',
        phone: '+380481234567',
      },
      {
        officeNumber: '7',
        city: 'Одеса',
        address: 'просп. Шевченка, 5',
        latitude: 46.4693,
        longitude: 30.7325,
        workingHours: '08:00-19:00',
        phone: '+380481234568',
      },
      {
        officeNumber: '8',
        city: 'Харків',
        address: 'пл. Свободи, 1',
        latitude: 49.9935,
        longitude: 36.2304,
        workingHours: '09:00-18:00',
        phone: '+380571234567',
      },
      {
        officeNumber: '9',
        city: 'Харків',
        address: 'вул. Сумська, 25',
        latitude: 50.0007,
        longitude: 36.2292,
        workingHours: '09:00-20:00',
        phone: '+380571234568',
      },
      {
        officeNumber: '10',
        city: 'Дніпро',
        address: 'просп. Дмитра Яворницького, 50',
        latitude: 48.4647,
        longitude: 35.0462,
        workingHours: '09:00-19:00',
        phone: '+380561234567',
      },
    ];

    for (const office of testOffices) {
      await this.create(office);
    }

    this.logger.log(`Створено ${testOffices.length} тестових відділень`);
  }
}




