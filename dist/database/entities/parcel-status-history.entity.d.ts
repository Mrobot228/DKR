import { Parcel } from './parcel.entity';
import { ParcelStatus } from '../../constants/parcel-status.enum';
export declare class ParcelStatusHistory {
    id: number;
    parcel: Parcel;
    parcelId: number;
    status: ParcelStatus;
    comment: string;
    location: string;
    timestamp: Date;
}
