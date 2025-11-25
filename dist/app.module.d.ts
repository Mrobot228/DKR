import { OnModuleInit } from '@nestjs/common';
import { PostOfficesService } from './modules/post-offices/post-offices.service';
export declare class AppModule implements OnModuleInit {
    private readonly postOfficesService;
    private readonly logger;
    constructor(postOfficesService: PostOfficesService);
    onModuleInit(): Promise<void>;
}
