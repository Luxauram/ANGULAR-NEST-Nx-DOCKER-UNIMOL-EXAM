import { Controller, Get } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';

@Controller('health')
export class HealthController {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  @Get()
  async check() {
    try {
      const pong = await this.redis.ping();
      return {
        status: pong === 'PONG' ? 'ok' : 'error',
        service: 'feed-service',
        db: 'redis',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'error',
        service: 'feed-service',
        db: 'redis',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
