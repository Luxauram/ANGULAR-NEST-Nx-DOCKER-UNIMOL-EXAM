import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import * as dotenv from 'dotenv';
import { Neo4jRepository } from './repositories/neo4j.repository';
import { SocialGraphService } from './services/social-graph.service';
import { SocialGraphController } from './controllers/social-graph.controller';
import { Neo4jService } from './services/neo4j.service';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [SocialGraphController, HealthController],
  providers: [SocialGraphService, Neo4jService, Neo4jRepository],
})
export class AppModule {}
