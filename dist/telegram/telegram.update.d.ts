import { Context, Scenes } from 'telegraf';
import { UsersService } from '../modules/users/users.service';
import { ParcelsService } from '../modules/parcels/parcels.service';
import { PostOfficesService } from '../modules/post-offices/post-offices.service';
import { ConfigService } from '@nestjs/config';
interface BotContext extends Context {
    scene: Scenes.SceneContextScene<BotContext>;
    session: any;
}
export declare class TelegramUpdate {
    private readonly usersService;
    private readonly parcelsService;
    private readonly postOfficesService;
    private readonly configService;
    private readonly logger;
    private readonly adminIds;
    constructor(usersService: UsersService, parcelsService: ParcelsService, postOfficesService: PostOfficesService, configService: ConfigService);
    onStart(ctx: BotContext): Promise<void>;
    onHelp(ctx: BotContext): Promise<void>;
    onFindCommand(ctx: BotContext): Promise<void>;
    onCreateCommand(ctx: BotContext): Promise<void>;
    onTrackCommand(ctx: BotContext): Promise<void>;
    onMyParcelsCommand(ctx: BotContext): Promise<void>;
    onCalcCommand(ctx: BotContext): Promise<void>;
    onAdminCommand(ctx: BotContext): Promise<void>;
    onText(ctx: BotContext): Promise<void>;
    onMyParcelsAction(ctx: BotContext): Promise<void>;
    onParcelsPage(ctx: BotContext): Promise<void>;
    onParcelDetails(ctx: BotContext): Promise<void>;
    onTrackAction(ctx: BotContext): Promise<void>;
    onDetailsAction(ctx: BotContext): Promise<void>;
    onMainMenu(ctx: BotContext): Promise<void>;
    onAdminStats(ctx: BotContext): Promise<void>;
    onAdminFindParcel(ctx: BotContext): Promise<void>;
    onAdminMenu(ctx: BotContext): Promise<void>;
    onAdminChangeStatus(ctx: BotContext): Promise<void>;
    onSetStatus(ctx: BotContext): Promise<void>;
    onIgnore(ctx: BotContext): Promise<void>;
    private showUserParcels;
    private trackParcelDirect;
    private looksLikeTrackingNumber;
    private isAdmin;
}
export {};
