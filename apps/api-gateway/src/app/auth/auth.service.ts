import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MicroserviceService } from '../services/microservice.service';

export interface JwtPayload {
  userId: string;
  email: string;
  username: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly microserviceService: MicroserviceService
  ) {}

  /**
   * Login semplificato - per il progetto universitario
   * In produzione useresti password hashate, etc.
   */
  async login(
    email: string,
    password: string
  ): Promise<{ access_token: string; user: any }> {
    try {
      // Chiama il User Service per validare le credenziali
      const user = await this.microserviceService.post(
        'user',
        '/auth/validate',
        {
          email,
          password,
        }
      );

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Genera il JWT token
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
          fullName: user.fullName,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /**
   * Registrazione semplificata
   */
  async register(userData: {
    email: string;
    password: string;
    username: string;
    fullName?: string;
  }): Promise<{ access_token: string; user: any }> {
    try {
      // Crea l'utente tramite User Service
      const user = await this.microserviceService.post(
        'user',
        '/users',
        userData
      );

      // Genera subito il token per il login automatico
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
          fullName: user.fullName,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error; // Rilancia l'errore del microservizio
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
