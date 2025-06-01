import { Controller, Get } from '@nestjs/common';
import { Neo4jService } from 'nest-neo4j';

@Controller('health')
export class HealthController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @Get()
  async check() {
    try {
      await this.neo4jService.read(`RETURN 1 AS result`);
      return { status: 'ok', db: 'neo4j' };
    } catch {
      return { status: 'error', db: 'neo4j' };
    }
  }
}
