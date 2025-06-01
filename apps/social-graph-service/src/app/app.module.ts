import { Module } from '@nestjs/common';
import { Neo4jModule } from 'nest-neo4j';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health.controller';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    Neo4jModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        scheme: 'bolt',
        host: configService.get('NEO4J_HOST', 'neo4j'),
        port: parseInt(configService.get('NEO4J_PORT', '7687')),
        username: configService.get('NEO4J_USERNAME', 'neo4j'),
        password: configService.get('NEO4J_PASSWORD', 'password'),
        database: 'neo4j',
      }),
    }),
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
