/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { User, CreateUserData, UpdateUserData } from '../models/user.model';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Crea un nuovo utente
  async create(
    createUserDto: CreateUserDto & { passwordHash: string }
  ): Promise<User> {
    const userData: CreateUserData = {
      username: createUserDto.username,
      email: createUserDto.email,
      passwordHash: createUserDto.passwordHash,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      bio: createUserDto.bio,
    };

    return await this.prisma.user.create({
      data: userData,
    });
  }

  // Trova tutti gli utenti (con paginazione)
  async findAll(page: number = 1, limit: number = 10): Promise<User[]> {
    return await this.prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      where: { isActive: true },
    });
  }

  // Trova utente per ID
  async findById(id: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { id },
    });
  }

  // Trova utente per username
  async findByUsername(username: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { username },
    });
  }

  // Trova utente per email
  async findByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  // Aggiorna utente
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    try {
      const updateData: UpdateUserData = {
        ...(updateUserDto.username && { username: updateUserDto.username }),
        ...(updateUserDto.email && { email: updateUserDto.email }),
        ...(updateUserDto.firstName && { firstName: updateUserDto.firstName }),
        ...(updateUserDto.lastName && { lastName: updateUserDto.lastName }),
        ...(updateUserDto.bio !== undefined && { bio: updateUserDto.bio }),
      };

      return await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      // Se l'ID non esiste, Prisma lancia un errore
      return null;
    }
  }

  // Elimina utente (soft delete - setta isActive a false)
  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { isActive: false },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Elimina utente definitivamente (hard delete)
  async hardDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Conta utenti totali
  async count(): Promise<number> {
    return await this.prisma.user.count({
      where: { isActive: true },
    });
  }

  // Cerca utenti per username o nome (per funzionalità di ricerca)
  async search(query: string): Promise<User[]> {
    return await this.prisma.user.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }

  // Verifica se username esiste
  async usernameExists(username: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { username },
    });
    return count > 0;
  }

  // Verifica se email esiste
  async emailExists(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { email },
    });
    return count > 0;
  }

  // Aggiorna utente con dati generici (per uso interno, es. password)
  async updateWithData(
    id: string,
    updateData: UpdateUserData
  ): Promise<User | null> {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      return null;
    }
  }
  async findAllWithCount(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    const [users, total] = await Promise.all([
      this.findAll(page, limit),
      this.count(),
    ]);

    return {
      users,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }
}
