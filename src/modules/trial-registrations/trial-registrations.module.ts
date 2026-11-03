import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { SettingsModule } from '../settings/settings.module';
import {
  PublicTrialRegistrationsController,
  AdminTrialRegistrationsController,
} from './trial-registrations.controller';
import { TrialRegistrationsService } from './trial-registrations.service';

@Module({
  imports: [DatabaseModule, SettingsModule],
  controllers: [PublicTrialRegistrationsController, AdminTrialRegistrationsController],
  providers: [TrialRegistrationsService],
})
export class TrialRegistrationsModule {}
