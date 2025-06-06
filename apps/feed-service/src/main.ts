import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';

dotenv.config();

function getApiGatewayUrl(): string {
  if (process.env.FEED_SERVICE_URL) return process.env.FEED_SERVICE_URL;
  if (process.env.FEED_SERVICE_DOCKER) return process.env.FEED_SERVICE_DOCKER;

  return process.env.NODE_ENV === 'production'
    ? 'http://localhost:3003'
    : 'http://host.docker.internal:3003';
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const actual_url = getApiGatewayUrl();
    const port = process.env.FEED_SERVICE_PORT || 3003;

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
      //origin: ['http://localhost:4200', 'http://localhost:3000'],
      //origin: actual_url,
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    await app.listen(port);

    Logger.log(`🔄 Feed Service running on ${actual_url}`);
    Logger.log(`📊 Health check: ${actual_url}/health`);
    Logger.log(
      `🗄️  Database: ${
        process.env.NODE_ENV === 'production' ? 'Production' : 'Development'
      } mode`
    );
  } catch (error) {
    Logger.error('❌ Failed to start Feed Service:', error);
    process.exit(1);
  }
}

bootstrap();
