import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  coordinates: Coordinates;
  formattedAddress: string;
}

export interface PostOfficeResult {
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: number;
  type: string; // 'nova_poshta', 'ukrposhta', 'other'
  openingHours?: string;
  phone?: string;
}

@Injectable()
export class MapsService {
  private readonly logger = new Logger(MapsService.name);
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY', '');
  }

  /**
   * Геокодування адреси - перетворення адреси в координати
   */
  async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: `${address}, Україна`,
          format: 'json',
          limit: 1,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'PostOfficeBot/1.0 (telegram bot)',
          'Accept-Language': 'uk',
        },
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          coordinates: {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
          },
          formattedAddress: result.display_name,
        };
      }

      return null;
    } catch (error) {
      this.logger.error('Помилка геокодування:', error.message);
      return null;
    }
  }

  /**
   * Пошук реальних поштових відділень через Overpass API (OpenStreetMap)
   */
  async findRealPostOffices(
    lat: number,
    lng: number,
    radiusMeters: number = 3000,
    limit: number = 5,
  ): Promise<PostOfficeResult[]> {
    try {
      // Overpass API запит для пошуку поштових відділень
      const overpassQuery = `
        [out:json][timeout:25];
        (
          // Нова Пошта
          node["brand"="Нова Пошта"](around:${radiusMeters},${lat},${lng});
          node["name"~"Нова Пошта|Nova Poshta|Нова пошта",i](around:${radiusMeters},${lat},${lng});
          // Укрпошта
          node["brand"="Укрпошта"](around:${radiusMeters},${lat},${lng});
          node["name"~"Укрпошта|Ukrposhta",i](around:${radiusMeters},${lat},${lng});
          // Загальні поштові відділення
          node["amenity"="post_office"](around:${radiusMeters},${lat},${lng});
          // Поштомати
          node["amenity"="parcel_locker"](around:${radiusMeters},${lat},${lng});
          node["amenity"="post_box"](around:${radiusMeters},${lat},${lng});
        );
        out body;
      `;

      const response = await axios.post(
        'https://overpass-api.de/api/interpreter',
        `data=${encodeURIComponent(overpassQuery)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'PostOfficeBot/1.0',
          },
          timeout: 30000,
        },
      );

      if (!response.data || !response.data.elements) {
        return [];
      }

      const offices: PostOfficeResult[] = response.data.elements
        .map((element: any) => {
          const tags = element.tags || {};
          const name = tags.name || tags.brand || 'Поштове відділення';
          const distance = this.calculateDistance(lat, lng, element.lat, element.lon);

          // Визначаємо тип
          let type = 'other';
          const nameLower = name.toLowerCase();
          if (nameLower.includes('нова пошта') || nameLower.includes('nova poshta')) {
            type = 'nova_poshta';
          } else if (nameLower.includes('укрпошта') || nameLower.includes('ukrposhta')) {
            type = 'ukrposhta';
          }

          // Формуємо адресу
          const addressParts = [
            tags['addr:city'],
            tags['addr:street'],
            tags['addr:housenumber'],
          ].filter(Boolean);
          const address = addressParts.length > 0 
            ? addressParts.join(', ') 
            : tags.address || 'Адреса не вказана';

          return {
            name,
            address,
            lat: element.lat,
            lng: element.lon,
            distance,
            type,
            openingHours: tags.opening_hours,
            phone: tags.phone || tags['contact:phone'],
          };
        })
        .filter((office: PostOfficeResult) => office.distance <= radiusMeters / 1000)
        .sort((a: PostOfficeResult, b: PostOfficeResult) => a.distance - b.distance)
        .slice(0, limit);

      // Видаляємо дублікати за координатами
      const uniqueOffices = this.removeDuplicates(offices);

      return uniqueOffices;
    } catch (error) {
      this.logger.error('Помилка пошуку відділень:', error.message);
      return [];
    }
  }

  /**
   * Видалити дублікати за близькими координатами
   */
  private removeDuplicates(offices: PostOfficeResult[]): PostOfficeResult[] {
    const unique: PostOfficeResult[] = [];
    
    for (const office of offices) {
      const isDuplicate = unique.some(
        (u) => this.calculateDistance(u.lat, u.lng, office.lat, office.lng) < 0.05, // 50 метрів
      );
      if (!isDuplicate) {
        unique.push(office);
      }
    }
    
    return unique;
  }

  /**
   * Пошук через Nominatim (резервний варіант)
   */
  async searchPostOfficesNominatim(
    lat: number,
    lng: number,
    radiusKm: number = 3,
  ): Promise<PostOfficeResult[]> {
    try {
      // Пошук поштових відділень через Nominatim
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: 'пошта',
          format: 'json',
          limit: 20,
          viewbox: `${lng - 0.05},${lat + 0.05},${lng + 0.05},${lat - 0.05}`,
          bounded: 1,
          addressdetails: 1,
        },
        headers: {
          'User-Agent': 'PostOfficeBot/1.0',
          'Accept-Language': 'uk',
        },
      });

      if (!response.data || response.data.length === 0) {
        return [];
      }

      return response.data
        .map((item: any) => {
          const distance = this.calculateDistance(
            lat,
            lng,
            parseFloat(item.lat),
            parseFloat(item.lon),
          );

          let type = 'other';
          const name = item.display_name.toLowerCase();
          if (name.includes('нова пошта') || name.includes('nova poshta')) {
            type = 'nova_poshta';
          } else if (name.includes('укрпошта')) {
            type = 'ukrposhta';
          }

          return {
            name: item.name || 'Поштове відділення',
            address: item.display_name.split(',').slice(0, 3).join(','),
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            distance,
            type,
          };
        })
        .filter((office: PostOfficeResult) => office.distance <= radiusKm)
        .sort((a: PostOfficeResult, b: PostOfficeResult) => a.distance - b.distance)
        .slice(0, 5);
    } catch (error) {
      this.logger.error('Помилка пошуку Nominatim:', error.message);
      return [];
    }
  }

  /**
   * Комбінований пошук - спочатку Overpass, потім Nominatim
   */
  async findNearestPostOffices(
    lat: number,
    lng: number,
    radiusKm: number = 3,
    limit: number = 5,
  ): Promise<PostOfficeResult[]> {
    // Спробуємо Overpass API
    let offices = await this.findRealPostOffices(lat, lng, radiusKm * 1000, limit);

    // Якщо не знайдено - пробуємо Nominatim
    if (offices.length === 0) {
      this.logger.log('Overpass не знайшов результатів, пробуємо Nominatim...');
      offices = await this.searchPostOfficesNominatim(lat, lng, radiusKm);
    }

    return offices;
  }

  /**
   * Отримати посилання на Google Maps
   */
  getGoogleMapsLink(lat: number, lng: number): string {
    return `https://www.google.com/maps?q=${lat},${lng}`;
  }

  /**
   * Отримати посилання для прокладання маршруту
   */
  getDirectionsLink(fromLat: number, fromLng: number, toLat: number, toLng: number): string {
    return `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`;
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
    return Math.round(R * c * 100) / 100;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Форматувати відстань для відображення
   */
  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)} м`;
    }
    return `${distanceKm.toFixed(1)} км`;
  }

  /**
   * Отримати емодзі для типу відділення
   */
  getOfficeEmoji(type: string): string {
    switch (type) {
      case 'nova_poshta':
        return '📦';
      case 'ukrposhta':
        return '📮';
      default:
        return '📍';
    }
  }

  /**
   * Отримати назву типу відділення
   */
  getOfficeTypeName(type: string): string {
    switch (type) {
      case 'nova_poshta':
        return 'Нова Пошта';
      case 'ukrposhta':
        return 'Укрпошта';
      default:
        return 'Пошта';
    }
  }
}
