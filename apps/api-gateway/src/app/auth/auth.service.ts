/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MicroserviceService } from '../services/microservice.service';
import { first } from 'rxjs';

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly microserviceService: MicroserviceService
  ) {}

  /**
   * Login + controllo sincronizzazione background
   */
  async login(
    email: string,
    password: string
  ): Promise<{ access_token: string; user: any }> {
    try {
      // 1. Validazione credenziali
      const user = await this.microserviceService.post(
        'user',
        '/users/auth/validate',
        { email, password }
      );

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // 2. Avvia controllo sincronizzazione in background
      setImmediate(() =>
        this.checkAndSyncInBackground(user.id, user.username, user.email)
      );

      // 3. Genera il JWT token IMMEDIATAMENTE
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          // fullName: user.fullName,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private async checkUserSyncStatus(userId: string): Promise<boolean> {
    try {
      // Verifica se l'utente exists nel Social Graph
      const response = await this.microserviceService.get(
        'socialGraph',
        `/users/${userId}/exists`
      );

      return response?.exists === true;
    } catch (error) {
      this.logger.warn(
        `Cannot check sync status for user ${userId}:`,
        error.message
      );
      return false; // Assume non sincronizzato se c'è errore
    }
  }

  /**
   * Controllo e sincronizzazione in background
   */
  private async checkAndSyncInBackground(
    userId: string,
    username: string,
    email: string
  ): Promise<void> {
    try {
      const isSynced = await this.checkUserSyncStatus(userId);

      if (!isSynced) {
        this.logger.warn(
          `⚠️ User ${userId} not synced. Auto-syncing in background...`
        );
        await this.syncUserWithSocialGraph(userId, username, email);
      } else {
        this.logger.log(`✅ User ${userId} sync status verified`);
      }
    } catch (error) {
      this.logger.error(
        `❌ Background sync check failed for user ${userId}:`,
        error
      );
    }
  }

  /**
   * Registrazione + sincronizzazione garantita
   */
  async register(userData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    bio?: string;
  }): Promise<{ access_token: string; user: any }> {
    try {
      // 1. Crea l'utente nel microservizio User
      const user = await this.microserviceService.post('user', '/users', {
        email: userData.email,
        password: userData.password,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio,
      });

      this.logger.log(`✅ User created: ${user.id}`);

      // 2. Sincronizza ESPLICITAMENTE con il Social Graph
      await this.syncUserWithSocialGraph(user.id, user.username, user.email);

      // 3. Genera il JWT token
      const payload: JwtPayload = {
        userId: user.id,
        email: user.email,
        username: user.username,
      };

      const access_token = this.jwtService.sign(payload);

      return {
        access_token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          bio: user.bio,
          // fullName: user.fullName,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Sincronizza utente con il social graph service
   * DUPLICATO dal UserService per garantire la sincronizzazione dall'API Gateway
   */
  private async syncUserWithSocialGraph(
    userId: string,
    username: string,
    email: string
  ): Promise<void> {
    try {
      await this.microserviceService.post('socialGraph', '/sync-user', {
        userId,
        username,
        email,
      });

      this.logger.log(
        `✅ User ${userId} synced with social graph from API Gateway`
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to sync user ${userId} with social graph from API Gateway:`,
        error.message
      );

      await this.retrySyncWithDelay(userId, username, email, 3);
    }
  }

  /**
   * Retry mechanism per la sincronizzazione
   */
  private async retrySyncWithDelay(
    userId: string,
    username: string,
    email: string,
    maxRetries: number,
    currentRetry: number = 1
  ): Promise<void> {
    if (currentRetry > maxRetries) {
      this.logger.error(
        `❌ Failed to sync user ${userId} after ${maxRetries} retries`
      );
      return;
    }

    // Attendi prima del retry (backoff esponenziale)
    const delay = Math.pow(2, currentRetry) * 1000; // 2s, 4s, 8s
    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
      await this.microserviceService.post('socialGraph', '/sync-user', {
        userId,
        username,
        email,
      });

      this.logger.log(
        `✅ User ${userId} synced with social graph on retry ${currentRetry}`
      );
    } catch (error) {
      this.logger.warn(`⚠️ Retry ${currentRetry} failed for user ${userId}`);
      await this.retrySyncWithDelay(
        userId,
        username,
        email,
        maxRetries,
        currentRetry + 1
      );
    }
  }

  /**
   * Valida un JWT token
   */
  async validateToken(token: string): Promise<JwtPayload> {
    try {
      const payload = this.jwtService.verify(token);
      return payload as JwtPayload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  /**
   * Estrae l'user ID dal token JWT
   */
  extractUserFromToken(token: string): string {
    try {
      const payload = this.jwtService.decode(token) as JwtPayload;
      return payload.userId;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
