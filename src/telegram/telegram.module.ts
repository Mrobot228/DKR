import { Module } from '@nestjs/common';
import { TelegramUpdate } from './telegram.update';
import { UsersModule } from '../modules/users/users.module';
import { ParcelsModule } from '../modules/parcels/parcels.module';
import { PostOfficesModule } from '../modules/post-offices/post-offices.module';
import { MapsModule } from '../modules/maps/maps.module';

// Scenes
import { FindOfficeScene } from './scenes/find-office.scene';
import { CreateParcelScene } from './scenes/create-parcel.scene';
import { TrackParcelScene } from './scenes/track-parcel.scene';
import { CalculatorScene } from './scenes/calculator.scene';

@Module({
  imports: [UsersModule, ParcelsModule, PostOfficesModule, MapsModule],
  providers: [
    TelegramUpdate,
    FindOfficeScene,
    CreateParcelScene,
    TrackParcelScene,
    CalculatorScene,
  ],
  exports: [
    TelegramUpdate,
    FindOfficeScene,
    CreateParcelScene,
    TrackParcelScene,
    CalculatorScene,
  ],
})
export class TelegramModule {}
