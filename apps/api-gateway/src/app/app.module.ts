import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { MicroserviceService } from './services/microservice.service';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AuthController } from './auth/auth.controller';
import { FeedController } from './controllers/feed.controller';
import { PostController } from './controllers/post.controller';
import { SocialGraphController } from './controllers/social-graph.controller';
import { UserController } from './controllers/user.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-super-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [
    UserController,
    PostController,
    SocialGraphController,
    FeedController,
    AuthController,
    HealthController,
  ],
  providers: [MicroserviceService, AuthService, JwtAuthGuard],
})
export class AppModule {}
