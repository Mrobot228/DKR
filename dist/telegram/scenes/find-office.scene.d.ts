import { Context } from 'telegraf';
import { MapsService, PostOfficeResult } from '../../modules/maps/maps.service';
interface FindOfficeContext extends Context {
    scene: any;
    session: {
        userLat?: number;
        userLng?: number;
        foundOffices?: PostOfficeResult[];
    };
}
export declare class FindOfficeScene {
    private readonly mapsService;
    private readonly logger;
    constructor(mapsService: MapsService);
    onSceneEnter(ctx: FindOfficeContext): Promise<void>;
    onLocation(ctx: FindOfficeContext): Promise<void>;
    onText(ctx: FindOfficeContext): Promise<any>;
    private searchAndShowOffices;
    onOfficeDetails(ctx: FindOfficeContext): Promise<void>;
    onBackToList(ctx: FindOfficeContext): Promise<any>;
    onMainMenu(ctx: FindOfficeContext): Promise<void>;
}
export {};
