import { Context } from 'telegraf';
import { ParcelsService } from '../../modules/parcels/parcels.service';
interface CalculatorContext extends Context {
    scene: any;
    session: {
        calcData: {
            fromCity?: string;
            toCity?: string;
            weight?: number;
        };
        step: string;
    };
}
export declare class CalculatorScene {
    private readonly parcelsService;
    private readonly logger;
    constructor(parcelsService: ParcelsService);
    onSceneEnter(ctx: CalculatorContext): Promise<void>;
    onText(ctx: CalculatorContext): Promise<any>;
    private showResults;
}
export {};
