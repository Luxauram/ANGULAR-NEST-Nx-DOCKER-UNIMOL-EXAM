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
   * Login
   */
  async login(
    email: string,
    password: string
  ): Promise<{ access_token: string; user: any }> {
    try {
      const user = await this.microserviceService.post(
        'user',
        '/users/auth/validate',
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
   * Registrazione
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
      const user = await this.microserviceService.post('user', '/users', {
        email: userData.email,
        password: userData.password,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio,
      });

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
      throw error;
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
