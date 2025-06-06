import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';

dotenv.config();

function getApiGatewayUrl(): string {
  if (process.env.USER_SERVICE_URL) return process.env.USER_SERVICE_URL;
  if (process.env.USER_SERVICE_DOCKER) return process.env.USER_SERVICE_DOCKER;

  return process.env.NODE_ENV === 'production'
    ? 'http://localhost:3001'
    : 'http://host.docker.internal:3001';
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const actual_url = getApiGatewayUrl();
    const port = process.env.USER_SERVICE_PORT || 3001;

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
      //origin: actual_url,
      origin: '*',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    await app.listen(port);

    Logger.log(`👤 User Service running on ${actual_url}`);
    Logger.log(`📊 Health check: ${actual_url}/health`);
    Logger.log(
      `🗄️  Database: ${
        process.env.NODE_ENV === 'production' ? 'Production' : 'Development'
      } mode`
    );
  } catch (error) {
    Logger.error('❌ Failed to start User Service:', error);
    process.exit(1);
  }
}

bootstrap();
