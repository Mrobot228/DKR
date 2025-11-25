import { Context } from 'telegraf';
import { ParcelsService } from '../../modules/parcels/parcels.service';
interface TrackParcelContext extends Context {
    scene: any;
    session: any;
}
export declare class TrackParcelScene {
    private readonly parcelsService;
    private readonly logger;
    constructor(parcelsService: ParcelsService);
    onSceneEnter(ctx: TrackParcelContext): Promise<void>;
    onText(ctx: TrackParcelContext): Promise<any>;
    private validateTrackingNumber;
    private normalizeTrackingNumber;
}
export {};
