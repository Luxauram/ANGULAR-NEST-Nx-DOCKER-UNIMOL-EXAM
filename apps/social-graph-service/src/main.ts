import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import * as dotenv from 'dotenv';

dotenv.config();

function getApiGatewayUrl(): string {
  if (process.env.SOCIAL_GRAPH_SERVICE_URL)
    return process.env.SOCIAL_GRAPH_SERVICE_URL;
  if (process.env.SOCIAL_GRAPH_SERVICE_DOCKER)
    return process.env.SOCIAL_GRAPH_SERVICE_DOCKER;

  return process.env.NODE_ENV === 'production'
    ? 'http://localhost:3004'
    : 'http://host.docker.internal:3004';
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const actual_url = getApiGatewayUrl();
    const port = process.env.SOCIAL_GRAPH_SERVICE_PORT || 3004;

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

    Logger.log(`🌐 Social Graph Service running on ${actual_url}`);
    Logger.log(`📊 Health check: ${actual_url}/health`);
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
