/* eslint-disable @typescript-eslint/no-inferrable-types */
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  HttpStatus,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserService } from '../services/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // POST /users - Crea nuovo utente
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  // GET /users - Lista tutti gli utenti (con paginazione)
  @Get()
  async findAllUsers(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10'
  ) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    return await this.userService.findAll(pageNum, limitNum);
  }

  // ------------------------------------------------------------------------
  // IMPORTANTE: Le rotte specifiche DEVONO essere prima della rotta parametrica /:id
  // ------------------------------------------------------------------------

  // GET /users/search?q=query - Cerca utenti (usando query parameter)
  @Get('search')
  async searchUsers(@Query('q') query: string) {
    if (!query) {
      return [];
    }
    return await this.userService.search(query);
  }

  // GET /users/search/:query - Cerca utenti (usando path parameter per compatibilità con API Gateway)
  @Get('search/:query')
  async searchUsersByPath(@Param('query') query: string) {
    if (!query) {
      return [];
    }
    return await this.userService.search(query);
  }

  // GET /users/stats - Statistiche utenti
  @Get('stats')
  async getUserStats() {
    return await this.userService.getStats();
  }

  // GET /users/health - Health check
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      service: 'user-service',
      timestamp: new Date().toISOString(),
    };
  }

  // GET /users/username/:username - Trova utente per username
  @Get('username/:username')
  async findUserByUsername(@Param('username') username: string) {
    return await this.userService.findByUsername(username);
  }

  // POST /users/auth/validate - Valida le credenziali utente (per API Gateway)
  @Post('auth/validate')
  async validateUser(@Body() validateDto: { email: string; password: string }) {
    console.log('🔍 Validating credentials for:', validateDto.email);

    try {
      const user = await this.userService.verifyPassword(
        validateDto.email,
        validateDto.password
      );

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Ritorna i dati utente (senza password)
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        createdAt: user.createdAt,
      };
    } catch (error) {
      console.error('Validation error:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  // ------------------------------------------------------------------------
  // IMPORTANTE: Le rotte specifiche DEVONO essere prima della rotta parametrica /:id
  // ------------------------------------------------------------------------

  // GET /users/:id - Trova utente per ID
  @Get(':id')
  async findUserById(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  // PUT /users/:id - Aggiorna utente
  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto
  ) {
    return await this.userService.update(id, updateUserDto);
  }

  // DELETE /users/:id - Elimina utente (soft delete)
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return await this.userService.remove(id);
  }

  // DELETE /users/:id/hard - Elimina utente definitivamente
  @Delete(':id/hard')
  async hardDeleteUser(@Param('id') id: string) {
    return await this.userService.hardRemove(id);
  }
}
