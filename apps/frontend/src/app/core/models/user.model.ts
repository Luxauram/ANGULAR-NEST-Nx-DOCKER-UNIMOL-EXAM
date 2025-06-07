export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  coverPhoto?: string;
  location?: string;
  website?: string;
  createdAt: Date;
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  coverPhoto?: string;
  location?: string;
  website?: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  coverPhoto?: string;
  location?: string;
  website?: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}
