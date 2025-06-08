import { Controller, Get } from '@nestjs/common';
import { Neo4jService } from './services/neo4j.service';

@Controller('health')
export class HealthController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @Get()
  async check() {
    try {
      await this.neo4jService.runQuery(`RETURN 1 AS result`);
      return {
        status: 'ok',
        service: 'social-graph-service',
        db: 'neo4j',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'error',
        service: 'social-graph-service',
        db: 'neo4j',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
