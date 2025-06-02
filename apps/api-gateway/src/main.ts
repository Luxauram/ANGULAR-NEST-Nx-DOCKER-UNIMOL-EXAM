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
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    });

    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);

    const port = process.env.API_GATEWAY_PORT || 3000;
    await app.listen(port);

    Logger.log(`🚀 API Gateway running on http://localhost:${port}`);
    Logger.log(`📊 Health check: http://localhost:${port}/api/health`);
    Logger.log(
      `🌐 Environment: ${
        process.env.NODE_ENV === 'production' ? 'Production' : 'Development'
      } mode`
    );
    Logger.log(
      `🔗 CORS enabled for: ${
        process.env.FRONTEND_URL || 'http://localhost:4200'
      }`
    );
  } catch (error) {
    Logger.error('❌ Failed to start API Gateway:', error);
    process.exit(1);
  }
}

bootstrap();
