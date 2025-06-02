import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.connectWithRetry();
      this.logger.log('✅ Database connected successfully');

      if (process.env.NODE_ENV !== 'production') {
        const { execSync } = require('child_process');
        try {
          execSync('npx prisma migrate dev --name auto', {
            stdio: 'inherit',
            timeout: 30000,
          });
          this.logger.log('✅ Migrations applied successfully');
        } catch (error) {
          this.logger.warn(
            '⚠️ Could not apply migrations automatically:',
            error.message
          );
        }
      } else {
        this.logger.log('📦 Production mode: migrations handled by deployment');
      }
    } catch (error) {
      this.logger.error('❌ Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
      this.logger.log('🔌 Database disconnected');
    } catch (error) {
      this.logger.error('❌ Error disconnecting from database:', error);
    }
  }

  private async connectWithRetry(maxRetries = 5, delay = 2000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.$connect();
        return;
      } catch (error) {
        this.logger.warn(`Connection attempt ${i + 1}/${maxRetries} failed`);
        if (i === maxRetries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  async transaction<T>(fn: (prisma: PrismaClient) => Promise<T>): Promise<T> {
    return this.$transaction(fn);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.$queryRaw`SELECT 1`;
      return true;
    } catch {
      return false;
    }
  }
}
