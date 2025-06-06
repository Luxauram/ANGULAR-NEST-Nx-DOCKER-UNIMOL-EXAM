import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';

dotenv.config();

function getApiGatewayUrl(): string {
  if (process.env.API_GATEWAY_URL) return process.env.API_GATEWAY_URL;
  if (process.env.API_GATEWAY_DOCKER) return process.env.API_GATEWAY_DOCKER;

  return process.env.NODE_ENV === 'production'
    ? 'http://localhost:3000'
    : 'http://host.docker.internal:3000';
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const actual_url = getApiGatewayUrl();
    const port = process.env.API_GATEWAY_PORT || 3000;

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
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);

    await app.listen(port);

    Logger.log(`🚀 API Gateway running on ${actual_url}`);
    Logger.log(`📊 Health check: ${actual_url}/api/health`);
    Logger.log(
      `🌐 Environment: ${
        process.env.NODE_ENV === 'production' ? 'Production' : 'Development'
      } mode`
    );
    Logger.log(`🔗 CORS enabled for: ${actual_url}`);
  } catch (error) {
    Logger.error('❌ Failed to start API Gateway:', error);
    process.exit(1);
  }
}

bootstrap();
