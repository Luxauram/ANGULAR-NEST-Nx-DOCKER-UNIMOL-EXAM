import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      })
    );

    app.enableCors({
      // origin: process.env.FRONTEND_URL || 'http://localhost:4200',
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    const port = process.env.SOCIAL_GRAPH_SERVICE_PORT || 3004;
    await app.listen(port);

    Logger.log(`🌐 Social Graph Service running on http://localhost:${port}`);
    Logger.log(`📊 Health check: http://localhost:${port}/api/health`);
    Logger.log(
      `📊 Neo4j Database: ${
        process.env.NODE_ENV === 'production' ? 'Production' : 'Development'
      } mode`
    );
    Logger.log(`🔗 Graph connections ready for social network operations`);
  } catch (error) {
    Logger.error('❌ Failed to start Social Graph Service:', error);
    process.exit(1);
  }
}

bootstrap();
