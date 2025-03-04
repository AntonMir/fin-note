import { Module } from '@nestjs/common';
import { HealthModule } from '@modules/health/health.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HealthModule,
  ],
})
export class AppModule {}
