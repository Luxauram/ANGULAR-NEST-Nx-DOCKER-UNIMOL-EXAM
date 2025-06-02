import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Neo4jRepository } from '../repositories/neo4j.repository';

import { UserNode } from '../models/relationship.model';
import { FollowUserDto } from '../dto/follow-user.dto';
import { GetFollowersDto } from '../dto/get-followers.dto';

@Injectable()
export class SocialGraphService {
  constructor(private neo4jRepository: Neo4jRepository) {}

  // Crea un nodo utente (chiamato quando un utente si registra)
  async createUser(
    userId: string,
    username: string,
    email: string
  ): Promise<UserNode> {
    try {
      return await this.neo4jRepository.createUserNode(userId, username, email);
    } catch (error) {
      throw new BadRequestException('Failed to create user node');
    }
  }

  // Segui un utente
  async followUser(
    followUserDto: FollowUserDto
  ): Promise<{ success: boolean; message: string }> {
    const { followerId, followingId } = followUserDto;

    // Non puoi seguire te stesso
    if (followerId === followingId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    try {
      const success = await this.neo4jRepository.followUser(
        followerId,
        followingId
      );

      if (!success) {
        return {
          success: false,
          message: 'Already following this user',
        };
      }

      return {
        success: true,
        message: 'Successfully followed user',
      };
    } catch (error) {
      throw new BadRequestException('Failed to follow user');
    }
  }

  // Smetti di seguire un utente
  async unfollowUser(
    followerId: string,
    followingId: string
  ): Promise<{ success: boolean; message: string }> {
    if (followerId === followingId) {
      throw new BadRequestException('Cannot unfollow yourself');
    }

    try {
      const success = await this.neo4jRepository.unfollowUser(
        followerId,
        followingId
      );

      if (!success) {
        return {
          success: false,
          message: 'Not following this user',
        };
      }

      return {
        success: true,
        message: 'Successfully unfollowed user',
      };
    } catch (error) {
      throw new BadRequestException('Failed to unfollow user');
    }
  }

  // Ottieni followers
  async getFollowers(getFollowersDto: GetFollowersDto): Promise<UserNode[]> {
    const { userId, limit } = getFollowersDto;
    const limitNumber = limit ? parseInt(limit) : 50;

    try {
      return await this.neo4jRepository.getFollowers(userId, limitNumber);
    } catch (error) {
      throw new NotFoundException('Failed to get followers');
    }
  }

  // Ottieni following
  async getFollowing(userId: string, limit = 50): Promise<UserNode[]> {
    try {
      return await this.neo4jRepository.getFollowing(userId, limit);
    } catch (error) {
      throw new NotFoundException('Failed to get following');
    }
  }

  // Ottieni statistiche utente (followers count, following count)
  async getUserStats(userId: string): Promise<{
    followersCount: number;
    followingCount: number;
  }> {
    try {
      const [followersCount, followingCount] = await Promise.all([
        this.neo4jRepository.getFollowersCount(userId),
        this.neo4jRepository.getFollowingCount(userId),
      ]);

      return {
        followersCount,
        followingCount,
      };
    } catch (error) {
      throw new NotFoundException('Failed to get user stats');
    }
  }

  // Controlla se un utente segue un altro
  async checkFollowStatus(
    followerId: string,
    followingId: string
  ): Promise<{ isFollowing: boolean }> {
    try {
      const isFollowing = await this.neo4jRepository.isFollowing(
        followerId,
        followingId
      );
      return { isFollowing };
    } catch (error) {
      throw new BadRequestException('Failed to check follow status');
    }
  }
}
