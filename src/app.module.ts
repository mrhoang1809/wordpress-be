import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { configuration, validationSchema } from './config/configuration';
import { DatabaseModule } from './database/database.module';
import { RevalidationModule } from './modules/revalidation/revalidation.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PagesModule } from './modules/pages/pages.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { MenusModule } from './modules/menus/menus.module';
import { PostsModule } from './modules/posts/posts.module';
import { MediaModule } from './modules/media/media.module';
import { SettingsModule } from './modules/settings/settings.module';
import { MessagingModule } from './modules/messaging/messaging.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { LocationsModule } from './modules/locations/locations.module';
import { TrialRegistrationsModule } from './modules/trial-registrations/trial-registrations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ]),
    DatabaseModule,
    RevalidationModule,
    AuthModule,
    UsersModule,
    PagesModule,
    CategoriesModule,
    MenusModule,
    PostsModule,
    MediaModule,
    SettingsModule,
    MessagingModule,
    PromotionsModule,
    LocationsModule,
    TrialRegistrationsModule,
  ],
})
export class AppModule {}
