import { User as PrismaUser } from '@prisma/client';

export type User = PrismaUser;

export interface CreateUserData {
  username: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  bio?: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  passwordHash?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  isActive?: boolean;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  fullName: string;
}

// Helper per convertire User in UserResponse (senza password)
export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    bio: user.bio,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    fullName: `${user.firstName} ${user.lastName}`,
  };
}
