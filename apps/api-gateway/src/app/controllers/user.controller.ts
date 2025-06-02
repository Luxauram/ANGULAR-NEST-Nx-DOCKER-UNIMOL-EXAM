import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MicroserviceService } from '../services/microservice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// DTOs
export class CreateUserDto {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}

export class UpdateUserDto {
  fullName?: string;
  username?: string;
  // Non permettiamo di cambiare email/password tramite API Gateway
}

@Controller('users')
export class UserController {
  constructor(private readonly microserviceService: MicroserviceService) {}

  /**
   * POST /api/users
   * Crea nuovo utente (pubblico - per registrazione)
   */
  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    console.log('👤 Creating user:', createUserDto.username);

    return await this.microserviceService.post('user', '/users', createUserDto);
  }

  /**
   * GET /api/users/profile
   * Ottieni profilo utente corrente (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getCurrentUserProfile(@Request() req) {
    const userId = req.user.userId;
    console.log('👤 Getting profile for user:', userId);

    return await this.microserviceService.get('user', `/users/${userId}`);
  }

  /**
   * GET /api/users/:id
   * Ottieni profilo utente pubblico
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    console.log('👤 Getting public profile for user:', id);

    return await this.microserviceService.get('user', `/users/${id}`);
  }

  /**
   * PUT /api/users/profile
   * Aggiorna profilo utente corrente (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateCurrentUserProfile(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const userId = req.user.userId;
    console.log('👤 Updating profile for user:', userId);

    return await this.microserviceService.put(
      'user',
      `/users/${userId}`,
      updateUserDto
    );
  }

  /**
   * DELETE /api/users/profile
   * Elimina account utente corrente (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async deleteCurrentUser(@Request() req) {
    const userId = req.user.userId;
    console.log('👤 Deleting user:', userId);

    return await this.microserviceService.delete('user', `/users/${userId}`);
  }

  /**
   * GET /api/users/search/:query
   * Cerca utenti per username o fullName
   */
  @UseGuards(JwtAuthGuard)
  @Get('search/:query')
  async searchUsers(@Param('query') query: string) {
    console.log('🔍 Searching users:', query);

    return await this.microserviceService.get('user', `/users/search/${query}`);
  }
}
