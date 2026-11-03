import { Module } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { LocationsController, PublicLocationsController } from './locations.controller';

@Module({
  providers: [LocationsService],
  controllers: [LocationsController, PublicLocationsController],
  exports: [LocationsService],
})
export class LocationsModule {}
