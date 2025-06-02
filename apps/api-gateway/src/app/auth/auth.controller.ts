import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

// DTOs
export class LoginDto {
  email: string;
  password: string;
}

export class RegisterDto {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Login utente
   */
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('🔐 Login attempt for:', loginDto.email);

    return await this.authService.login(loginDto.email, loginDto.password);
  }

  /**
   * POST /api/auth/register
   * Registrazione nuovo utente
   */
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    console.log('📝 Registration attempt for:', registerDto.email);

    return await this.authService.register(registerDto);
  }
}
