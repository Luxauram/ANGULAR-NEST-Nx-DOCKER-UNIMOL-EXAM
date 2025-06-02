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
} from '@nestjs/common';
import { MicroserviceService } from '../services/microservice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateUserDto } from '../dto/user/create-user.dto';
import { UpdateUserDto } from '../dto/user/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly microserviceService: MicroserviceService) {}

  /**
   * POST /api/users
   * Crea nuovo utente (pubblico - per registrazione)
   */
  @Post()
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
   * GET /api/users/search/:query
   * Cerca utenti per username o nome
   */
  @UseGuards(JwtAuthGuard)
  @Get('search/:query')
  async searchUsers(@Param('query') query: string) {
    console.log('🔍 Searching users:', query);

    return await this.microserviceService.get('user', `/users/search/${query}`);
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
}
