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

  // GET /users/search?q=query - Cerca utenti
  @Get('search')
  async searchUsers(@Query('q') query: string) {
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

  // GET /users/:id - Trova utente per ID
  @Get(':id')
  async findUserById(@Param('id') id: string) {
    return await this.userService.findById(id);
  }

  // GET /users/username/:username - Trova utente per username
  @Get('username/:username')
  async findUserByUsername(@Param('username') username: string) {
    return await this.userService.findByUsername(username);
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
