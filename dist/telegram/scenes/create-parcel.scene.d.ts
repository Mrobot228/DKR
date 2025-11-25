import { Context } from 'telegraf';
import { ParcelsService } from '../../modules/parcels/parcels.service';
import { UsersService } from '../../modules/users/users.service';
import { PostOfficesService } from '../../modules/post-offices/post-offices.service';
import { CreateParcelDto } from '../../modules/parcels/dto/create-parcel.dto';
interface ParcelData extends Partial<CreateParcelDto> {
    senderOfficeNumber?: string;
    recipientOfficeNumber?: string;
}
interface CreateParcelContext extends Context {
    scene: any;
    session: {
        parcelData: ParcelData;
        step: string;
    };
}
export declare class CreateParcelScene {
    private readonly parcelsService;
    private readonly usersService;
    private readonly postOfficesService;
    private readonly logger;
    constructor(parcelsService: ParcelsService, usersService: UsersService, postOfficesService: PostOfficesService);
    onSceneEnter(ctx: CreateParcelContext): Promise<void>;
    onText(ctx: CreateParcelContext): Promise<any>;
    onDeliveryStandard(ctx: CreateParcelContext): Promise<void>;
    onDeliveryExpress(ctx: CreateParcelContext): Promise<void>;
    onConfirmParcel(ctx: CreateParcelContext): Promise<void>;
    onCancelParcel(ctx: CreateParcelContext): Promise<void>;
    private nextStep;
    private askDeliveryType;
    private showConfirmation;
    private createParcel;
    private notifyRecipient;
    private validatePhone;
    private normalizePhone;
}
export {};
