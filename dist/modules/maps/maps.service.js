"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var MapsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_1 = require("axios");
let MapsService = MapsService_1 = class MapsService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(MapsService_1.name);
        this.apiKey = this.configService.get('GOOGLE_MAPS_API_KEY', '');
    }
    async geocodeAddress(address) {
        try {
            const response = await axios_1.default.get('https://nominatim.openstreetmap.org/search', {
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
        }
        catch (error) {
            this.logger.error('Помилка геокодування:', error.message);
            return null;
        }
    }
    async findRealPostOffices(lat, lng, radiusMeters = 3000, limit = 5) {
        try {
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
            const response = await axios_1.default.post('https://overpass-api.de/api/interpreter', `data=${encodeURIComponent(overpassQuery)}`, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'PostOfficeBot/1.0',
                },
                timeout: 30000,
            });
            if (!response.data || !response.data.elements) {
                return [];
            }
            const offices = response.data.elements
                .map((element) => {
                const tags = element.tags || {};
                const name = tags.name || tags.brand || 'Поштове відділення';
                const distance = this.calculateDistance(lat, lng, element.lat, element.lon);
                let type = 'other';
                const nameLower = name.toLowerCase();
                if (nameLower.includes('нова пошта') || nameLower.includes('nova poshta')) {
                    type = 'nova_poshta';
                }
                else if (nameLower.includes('укрпошта') || nameLower.includes('ukrposhta')) {
                    type = 'ukrposhta';
                }
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
                .filter((office) => office.distance <= radiusMeters / 1000)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, limit);
            const uniqueOffices = this.removeDuplicates(offices);
            return uniqueOffices;
        }
        catch (error) {
            this.logger.error('Помилка пошуку відділень:', error.message);
            return [];
        }
    }
    removeDuplicates(offices) {
        const unique = [];
        for (const office of offices) {
            const isDuplicate = unique.some((u) => this.calculateDistance(u.lat, u.lng, office.lat, office.lng) < 0.05);
            if (!isDuplicate) {
                unique.push(office);
            }
        }
        return unique;
    }
    async searchPostOfficesNominatim(lat, lng, radiusKm = 3) {
        try {
            const response = await axios_1.default.get('https://nominatim.openstreetmap.org/search', {
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
                .map((item) => {
                const distance = this.calculateDistance(lat, lng, parseFloat(item.lat), parseFloat(item.lon));
                let type = 'other';
                const name = item.display_name.toLowerCase();
                if (name.includes('нова пошта') || name.includes('nova poshta')) {
                    type = 'nova_poshta';
                }
                else if (name.includes('укрпошта')) {
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
                .filter((office) => office.distance <= radiusKm)
                .sort((a, b) => a.distance - b.distance)
                .slice(0, 5);
        }
        catch (error) {
            this.logger.error('Помилка пошуку Nominatim:', error.message);
            return [];
        }
    }
    async findNearestPostOffices(lat, lng, radiusKm = 3, limit = 5) {
        let offices = await this.findRealPostOffices(lat, lng, radiusKm * 1000, limit);
        if (offices.length === 0) {
            this.logger.log('Overpass не знайшов результатів, пробуємо Nominatim...');
            offices = await this.searchPostOfficesNominatim(lat, lng, radiusKm);
        }
        return offices;
    }
    getGoogleMapsLink(lat, lng) {
        return `https://www.google.com/maps?q=${lat},${lng}`;
    }
    getDirectionsLink(fromLat, fromLng, toLat, toLng) {
        return `https://www.google.com/maps/dir/${fromLat},${fromLng}/${toLat},${toLng}`;
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) *
                Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 100) / 100;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
    formatDistance(distanceKm) {
        if (distanceKm < 1) {
            return `${Math.round(distanceKm * 1000)} м`;
        }
        return `${distanceKm.toFixed(1)} км`;
    }
    getOfficeEmoji(type) {
        switch (type) {
            case 'nova_poshta':
                return '📦';
            case 'ukrposhta':
                return '📮';
            default:
                return '📍';
        }
    }
    getOfficeTypeName(type) {
        switch (type) {
            case 'nova_poshta':
                return 'Нова Пошта';
            case 'ukrposhta':
                return 'Укрпошта';
            default:
                return 'Пошта';
        }
    }
};
exports.MapsService = MapsService;
exports.MapsService = MapsService = MapsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], MapsService);
//# sourceMappingURL=maps.service.js.map