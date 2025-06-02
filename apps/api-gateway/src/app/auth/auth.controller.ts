import { Body, Controller, Post, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../dto/auth/login.dto';
import { RegisterDto } from '../dto/auth/register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/auth/login
   * Login utente
   */
  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    console.log('🔐 Login attempt for:', loginDto.email);

    return await this.authService.login(loginDto.email, loginDto.password);
  }

  /**
   * POST /api/auth/register
   * Registrazione nuovo utente
   */
  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    console.log('📝 Registration attempt for:', registerDto.email);

    return await this.authService.register(registerDto);
  }
}
