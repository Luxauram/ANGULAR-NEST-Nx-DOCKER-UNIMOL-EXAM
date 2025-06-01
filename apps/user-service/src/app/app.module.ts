import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { PrismaService } from './services/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'postgres',
    //     url: process.env.DATABASE_URL,
    //     autoLoadEntities: true,
    //     entities: [User],
    //     synchronize:
    //       configService.get('NODE_ENV', 'development') !== 'production',
    //     logging: configService.get('NODE_ENV', 'development') === 'development',
    //     ssl:
    //       configService.get('NODE_ENV') === 'production'
    //         ? { rejectUnauthorized: false }
    //         : false,
    //     name: 'default',
    //   }),
    // }),

    // TypeOrmModule.forFeature([User]),
  ],
  controllers: [UserController, HealthController],
  providers: [PrismaService, UserService, UserRepository],
  exports: [UserService, PrismaService],
})
export class AppModule {}
