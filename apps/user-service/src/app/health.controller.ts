import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async checkHealth() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        service: 'user-service',
        db: 'postgres',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        service: 'user-service',
        db: 'postgres',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
