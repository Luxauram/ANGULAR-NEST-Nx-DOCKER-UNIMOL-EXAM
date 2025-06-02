import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { HealthController } from './health.controller';
import { HttpModule } from '@nestjs/axios';
import { FeedController } from './controllers/feed.controller';
import { FeedService } from './services/feed.service';
import { RedisService } from './services/redis.service';
import { ExternalApiService } from './services/external-api.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    RedisModule.forRoot({
      type: 'single',
      url: process.env.REDIS_URL,
    }),
    HttpModule,
  ],
  controllers: [FeedController, HealthController],
  providers: [FeedService, RedisService, ExternalApiService],
})
export class AppModule {}
