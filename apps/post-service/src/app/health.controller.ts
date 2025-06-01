import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  async check() {
    const isConnected = this.connection.readyState === 1;
    return { status: isConnected ? 'ok' : 'error', db: 'mongodb' };
  }
}
