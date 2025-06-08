/* eslint-disable @typescript-eslint/no-inferrable-types */
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
  ValidationPipe,
  Query,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { MicroserviceService } from '../services/microservice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';
import { ChangePasswordDto } from '../dto/user/change-password.dto';

@Controller('users')
export class UserController {
  constructor(private readonly microserviceService: MicroserviceService) {}

  /**
   * POST /api/users
   * Crea nuovo utente (pubblico - per registrazione)
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    console.log('👤 Creating user:', createUserDto.username);
    console.log('📝 User data:', JSON.stringify(createUserDto, null, 2));

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
   * GET /api/users/stats
   * Statistiche utenti (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getUserStats() {
    console.log('📊 Getting user stats');

    return await this.microserviceService.get('user', '/users/stats');
  }

  /**
   * GET /api/users/search?q=query
   * Cerca utenti usando query parameter (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchUsers(@Query('q') query: string) {
    console.log('🔍 Searching users with query param:', query);

    return await this.microserviceService.get(
      'user',
      `/users/search?q=${query}`
    );
  }

  /**
   * GET /api/users/search/:query
   * Cerca utenti per username o nome (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get('search/:query')
  async searchUsersByPath(@Param('query') query: string) {
    console.log('🔍 Searching users with path param:', query);

    return await this.microserviceService.get('user', `/users/search/${query}`);
  }

  /**
   * GET /api/users/username/:username
   * Ottieni utente per username
   */
  @Get('username/:username')
  async getUserByUsername(@Param('username') username: string) {
    console.log('👤 Getting user by username:', username);

    return await this.microserviceService.get(
      'user',
      `/users/username/${username}`
    );
  }

  /**
   * POST /api/users/auth/validate
   * Valida credenziali utente (per autenticazione interna)
   */
  @Post('auth/validate')
  async validateUser(@Body() validateDto: { email: string; password: string }) {
    console.log('🔍 Validating credentials for:', validateDto.email);

    return await this.microserviceService.post(
      'user',
      '/users/auth/validate',
      validateDto
    );
  }

  /**
   * POST /api/users/profile/change-password
   * Cambia password utente corrente (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Post('profile/change-password')
  async changePassword(
    @Request() req,
    @Body(ValidationPipe) changePasswordDto: ChangePasswordDto
  ) {
    const userId = req.user.userId;
    console.log('🔐 Changing password for user:', userId);

    return await this.microserviceService.post(
      'user',
      `/users/${userId}/change-password`,
      changePasswordDto
    );
  }

  /**
   * GET /api/users
   * Lista tutti gli utenti con paginazione (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    console.log('👥 Getting all users - page:', page, 'limit:', limit);

    return await this.microserviceService.get(
      'user',
      `/users?page=${page}&limit=${limit}`
    );
  }

  /**
   * PUT /api/users/profile
   * Aggiorna profilo utente corrente (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateCurrentUserProfile(
    @Request() req,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto
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
   * DELETE /api/users/profile/hard
   * Elimina definitivamente account utente corrente (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Delete('profile/hard')
  async hardDeleteCurrentUser(@Request() req) {
    const userId = req.user.userId;
    console.log('💀 Hard deleting user:', userId);

    return await this.microserviceService.delete(
      'user',
      `/users/${userId}/hard`
    );
  }

  /**
   * GET /api/users/:id
   * Ottieni profilo utente pubblico per ID
   * IMPORTANTE: Questa rotta deve essere DOPO tutte le rotte specifiche
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    console.log('👤 Getting public profile for user ID:', id);

    // Validate ID format (basic validation)
    if (!id || id.trim().length === 0) {
      throw new Error('Invalid user ID');
    }

    try {
      const result = await this.microserviceService.get('user', `/users/${id}`);
      console.log('✅ User profile retrieved successfully:', result?.id);
      return result;
    } catch (error) {
      console.error('❌ Error getting user profile:', error);
      throw error;
    }
  }

  /**
   * PUT /api/users/:id
   * Aggiorna utente specifico (solo per admin - @TODO da proteggere)
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto
  ) {
    console.log('👤 Admin updating user:', id);
    // @TODO: Aggiungere controllo ruolo admin

    return await this.microserviceService.put(
      'user',
      `/users/${id}`,
      updateUserDto
    );
  }

  /**
   * DELETE /api/users/:id
   * Elimina utente specifico (solo per admin - @TODO da proteggere)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    console.log('👤 Admin deleting user:', id);
    // TODO: Aggiungere controllo ruolo admin

    return await this.microserviceService.delete('user', `/users/${id}`);
  }
  /**
   * DELETE /api/users/:id/hard
   * Elimina definitivamente utente specifico (solo per admin - @TODO da proteggere)
   */
  @UseGuards(JwtAuthGuard)
  @Delete(':id/hard')
  async hardDeleteUser(@Param('id') id: string) {
    console.log('💀 Admin hard deleting user:', id);
    // TODO: Aggiungere controllo ruolo admin

    return await this.microserviceService.delete('user', `/users/${id}/hard`);
  }
}
