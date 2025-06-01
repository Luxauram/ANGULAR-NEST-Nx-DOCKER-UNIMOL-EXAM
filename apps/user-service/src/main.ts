import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';

// Carica le variabili d'ambiente prima di tutto
dotenv.config();

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // Global pipes per validation
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

    // CORS configuration
    app.enableCors({
      origin: process.env.FRONTEND_URL || 'http://localhost:4200',
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });

    // Global prefix
    const globalPrefix = 'api';
    app.setGlobalPrefix(globalPrefix);

    // Port configuration
    const port = process.env.USER_SERVICE_PORT || 3001;

    await app.listen(port);

    Logger.log(`👤 User Service running on http://localhost:${port}`);
    Logger.log(`📊 Health check: http://localhost:${port}/api/health`);
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
