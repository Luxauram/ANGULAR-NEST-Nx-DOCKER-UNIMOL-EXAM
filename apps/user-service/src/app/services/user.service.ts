/* eslint-disable @typescript-eslint/no-inferrable-types */
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponse, toUserResponse } from '../models/user.model';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  private readonly saltRounds = 12;

  constructor(
    private readonly userRepository: UserRepository,
    private readonly httpService: HttpService
  ) {}

  // Crea un nuovo utente
  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    this.logger.log(`Creating user with username: ${createUserDto.username}`);

    // Verifica se username o email già esistono
    const [usernameExists, emailExists] = await Promise.all([
      this.userRepository.usernameExists(createUserDto.username),
      this.userRepository.emailExists(createUserDto.email),
    ]);

    if (usernameExists) {
      throw new ConflictException('Username already exists');
    }

    if (emailExists) {
      throw new ConflictException('Email already exists');
    }

    // Hash della password
    const passwordHash = await bcrypt.hash(
      createUserDto.password,
      this.saltRounds
    );

    try {
      const user = await this.userRepository.create({
        ...createUserDto,
        passwordHash,
      });

      this.logger.log(`User created successfully with ID: ${user.id}`);

      // Sincronizza con il social graph
      await this.syncUserWithSocialGraph(user.id, user.username, user.email);

      return toUserResponse(user);
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw new BadRequestException('Failed to create user');
    }
  }

  // Trova tutti gli utenti con paginazione
  async findAll(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    users: UserResponse[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const result = await this.userRepository.findAllWithCount(page, limit);

    return {
      ...result,
      users: result.users.map(toUserResponse),
    };
  }

  // Trova utente per ID
  async findById(id: string): Promise<UserResponse> {
    if (!id || typeof id !== 'string') {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toUserResponse(user);
  }

  // Trova utente per username
  async findByUsername(username: string): Promise<UserResponse> {
    if (!username) {
      throw new BadRequestException('Username is required');
    }

    const user = await this.userRepository.findByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toUserResponse(user);
  }

  // Trova utente per email
  async findByEmail(email: string): Promise<UserResponse> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return toUserResponse(user);
  }

  // Aggiorna utente
  async update(
    id: string,
    updateUserDto: UpdateUserDto
  ): Promise<UserResponse> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    // Verifica se l'utente esiste
    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new NotFoundException('User not found');
    }

    // Se viene aggiornato username o email, verifica che non esistano già
    if (
      updateUserDto.username &&
      updateUserDto.username !== existingUser.username
    ) {
      const usernameExists = await this.userRepository.usernameExists(
        updateUserDto.username
      );
      if (usernameExists) {
        throw new ConflictException('Username already exists');
      }
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.userRepository.emailExists(
        updateUserDto.email
      );
      if (emailExists) {
        throw new ConflictException('Email already exists');
      }
    }

    try {
      const updatedUser = await this.userRepository.update(id, updateUserDto);
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      this.logger.log(`User updated successfully: ${id}`);

      // Sincronizza con il social graph se username o email sono cambiati
      if (updateUserDto.username || updateUserDto.email) {
        await this.syncUserWithSocialGraph(
          updatedUser.id,
          updatedUser.username,
          updatedUser.email
        );
      }

      return toUserResponse(updatedUser);
    } catch (error) {
      this.logger.error(`Error updating user ${id}:`, error);
      throw new BadRequestException('Failed to update user');
    }
  }

  // Elimina utente (soft delete)
  async remove(id: string): Promise<{ message: string }> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const success = await this.userRepository.delete(id);
    if (!success) {
      throw new NotFoundException('User not found');
    }

    this.logger.log(`User soft deleted: ${id}`);

    // Sincronizza la cancellazione con il social graph
    await this.syncUserDeletionWithSocialGraph(id);

    return { message: 'User deleted successfully' };
  }

  // Elimina utente definitivamente
  async hardRemove(id: string): Promise<{ message: string }> {
    if (!id) {
      throw new BadRequestException('User ID is required');
    }

    const success = await this.userRepository.hardDelete(id);
    if (!success) {
      throw new NotFoundException('User not found');
    }

    this.logger.log(`User permanently deleted: ${id}`);

    // Sincronizza la cancellazione definitiva con il social graph
    await this.syncUserDeletionWithSocialGraph(id, true);

    return { message: 'User permanently deleted' };
  }

  // Cerca utenti
  async search(query: string): Promise<UserResponse[]> {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException(
        'Search query must be at least 2 characters long'
      );
    }

    const users = await this.userRepository.search(query.trim());
    return users.map(toUserResponse);
  }

  // Verifica password (utile per autenticazione)
  async verifyPassword(
    email: string,
    password: string
  ): Promise<UserResponse | null> {
    const user = await this.userRepository.findByEmail(email);
    if (!user || !user.isActive) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    return isValid ? toUserResponse(user) : null;
  }

  // Cambia password
  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verifica password corrente
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash della nuova password
    const newPasswordHash = await bcrypt.hash(newPassword, this.saltRounds);

    await this.userRepository.updateWithData(id, {
      passwordHash: newPasswordHash,
    });

    this.logger.log(`Password changed for user: ${id}`);
    return { message: 'Password updated successfully' };
  }

  // Statistiche utenti
  async getStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
  }> {
    const totalUsers = await this.userRepository.count();

    return {
      totalUsers,
      activeUsers: totalUsers,
    };
  }

  /**
   * Valida email e password utente
   */
  async validateUser(
    email: string,
    password: string
  ): Promise<UserResponse | null> {
    try {
      const user = await this.userRepository.findByEmail(email);

      if (!user || !user.isActive) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);

      if (!isValid) {
        return null;
      }

      return toUserResponse(user);
    } catch (error) {
      this.logger.error('Error validating user:', error);
      return null;
    }
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sincronizza utente con il social graph service
   */
  private async syncUserWithSocialGraph(
    userId: string,
    username: string,
    email: string
  ): Promise<void> {
    try {
      const socialGraphUrl =
        process.env.SOCIAL_GRAPH_SERVICE_URL ||
        process.env.SOCIAL_GRAPH_SERVICE_DOCKER ||
        'http://host.docker.internal:3004';

      if (!socialGraphUrl || !this.isValidUrl(socialGraphUrl)) {
        this.logger.error(`❌ Invalid social graph URL: ${socialGraphUrl}`);
        return;
      }

      await firstValueFrom(
        this.httpService.post(`${socialGraphUrl}/sync-user`, {
          userId,
          username,
          email,
        })
      );

      this.logger.log(`✅ User ${userId} synced with social graph`);
    } catch (error) {
      this.logger.error(
        `❌ Failed to sync user ${userId} with social graph:`,
        error
      );
    }
  }

  /**
   * Sincronizza cancellazione utente con il social graph service
   */
  private async syncUserDeletionWithSocialGraph(
    userId: string,
    permanent: boolean = false
  ): Promise<void> {
    try {
      const socialGraphUrl =
        process.env.SOCIAL_GRAPH_SERVICE_URL ||
        process.env.SOCIAL_GRAPH_SERVICE_DOCKER ||
        'http://host.docker.internal:3004';

      await firstValueFrom(
        this.httpService.delete(`${socialGraphUrl}/users/${userId}`, {
          data: { permanent },
        })
      );

      this.logger.log(
        `✅ User ${userId} deletion synced with social graph (permanent: ${permanent})`
      );
    } catch (error) {
      this.logger.error(
        `❌ Failed to sync user ${userId} deletion with social graph:`,
        error
      );
    }
  }
}
