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

  // Sincronizza utente dal user-service (chiamato dall'API Gateway)
  async syncUserFromUserService(
    userId: string,
    username: string,
    email: string
  ): Promise<UserNode> {
    console.log('🔄 [SocialGraphService] Syncing user from user-service:', {
      userId,
      username,
      email,
    });

    try {
      const userExists = await this.neo4jRepository.userExists(userId);

      if (userExists) {
        console.log('ℹ️ [SocialGraphService] User already exists, updating...');
        return await this.neo4jRepository.updateUserNode(
          userId,
          username,
          email
        );
      } else {
        console.log('➕ [SocialGraphService] Creating new user node...');
        return await this.neo4jRepository.createUserNode(
          userId,
          username,
          email
        );
      }
    } catch (error) {
      console.error('❌ [SocialGraphService] Failed to sync user:', error);
      throw new BadRequestException('Failed to sync user with social graph');
    }
  }

  private async ensureUserExists(userId: string): Promise<void> {
    const exists = await this.neo4jRepository.userExists(userId);
    if (!exists) {
      console.log(
        `⚠️ [SocialGraphService] User ${userId} not found in social graph`
      );
      throw new BadRequestException(
        `User ${userId} not found in social graph. Please sync user first.`
      );
    }
  }

  // Segui un utente
  async followUser(
    followUserDto: FollowUserDto
  ): Promise<{ success: boolean; message: string }> {
    const { followerId, followingId } = followUserDto;

    console.log('🚀 [SocialGraphService] Follow user request:', {
      followerId,
      followingId,
    });

    if (followerId === followingId) {
      console.log('⚠️ [SocialGraphService] User trying to follow themselves');
      throw new BadRequestException('Cannot follow yourself');
    }

    try {
      console.log('🔍 [SocialGraphService] Checking if users exist...');
      const followerExists = await this.neo4jRepository.userExists(followerId);
      const followingExists = await this.neo4jRepository.userExists(
        followingId
      );

      console.log('🔍 [SocialGraphService] Users existence:', {
        followerExists,
        followingExists,
      });

      if (!followerExists) {
        console.log(
          '❌ [SocialGraphService] Follower does not exist, creating...'
        );
        throw new BadRequestException(
          `Follower user ${followerId} does not exist in social graph`
        );
      }

      if (!followingExists) {
        console.log(
          '❌ [SocialGraphService] Following user does not exist, creating...'
        );
        throw new BadRequestException(
          `Following user ${followingId} does not exist in social graph`
        );
      }

      const success = await this.neo4jRepository.followUser(
        followerId,
        followingId
      );

      if (!success) {
        console.log('⚠️ [SocialGraphService] User already following');
        return {
          success: false,
          message: 'Already following this user',
        };
      }

      console.log('✅ [SocialGraphService] Follow successful');
      return {
        success: true,
        message: 'Successfully followed user',
      };
    } catch (error) {
      console.error('❌ [SocialGraphService] Follow failed:', error);
      throw new BadRequestException(error.message || 'Failed to follow user');
    }
  }

  // Smetti di seguire un utente
  async unfollowUser(
    followerId: string,
    followingId: string
  ): Promise<{ success: boolean; message: string }> {
    console.log('🚀 [SocialGraphService] Unfollow user request:', {
      followerId,
      followingId,
    });

    if (followerId === followingId) {
      console.log('⚠️ [SocialGraphService] User trying to unfollow themselves');
      throw new BadRequestException('Cannot unfollow yourself');
    }

    try {
      const success = await this.neo4jRepository.unfollowUser(
        followerId,
        followingId
      );

      if (!success) {
        console.log('⚠️ [SocialGraphService] User was not following');
        return {
          success: false,
          message: 'Not following this user',
        };
      }

      console.log('✅ [SocialGraphService] Unfollow successful');
      return {
        success: true,
        message: 'Successfully unfollowed user',
      };
    } catch (error) {
      console.error('❌ [SocialGraphService] Unfollow failed:', error);
      throw new BadRequestException('Failed to unfollow user');
    }
  }

  // Ottieni followers
  async getFollowers(getFollowersDto: GetFollowersDto): Promise<UserNode[]> {
    const { userId, limit } = getFollowersDto;
    const limitNumber = limit ? parseInt(limit) : 50;
    console.log('🚀 [SocialGraphService] Get followers request:', {
      userId,
      limit,
    });

    try {
      const followers = await this.neo4jRepository.getFollowers(
        userId,
        limitNumber
      );
      console.log(
        '✅ [SocialGraphService] Followers retrieved:',
        followers.length
      );
      return followers;
    } catch (error) {
      console.error('❌ [SocialGraphService] Get followers failed:', error);
      throw new NotFoundException('Failed to get followers');
    }
  }

  // Ottieni following
  async getFollowing(userId: string, limit = 50): Promise<UserNode[]> {
    console.log('🚀 [SocialGraphService] Get following request:', {
      userId,
      limit,
    });

    try {
      const following = await this.neo4jRepository.getFollowing(userId, limit);
      console.log(
        '✅ [SocialGraphService] Following retrieved:',
        following.length
      );
      return following;
    } catch (error) {
      console.error('❌ [SocialGraphService] Get following failed:', error);
      throw new NotFoundException('Failed to get following');
    }
  }

  // Ottieni statistiche utente (followers count, following count)
  async getUserStats(userId: string): Promise<{
    followersCount: number;
    followingCount: number;
  }> {
    console.log('🚀 [SocialGraphService] Get user stats request:', { userId });

    try {
      const [followersCount, followingCount] = await Promise.all([
        this.neo4jRepository.getFollowersCount(userId),
        this.neo4jRepository.getFollowingCount(userId),
      ]);

      const stats = {
        followersCount,
        followingCount,
      };

      console.log('✅ [SocialGraphService] User stats retrieved:', stats);
      return stats;
    } catch (error) {
      console.error('❌ [SocialGraphService] Get user stats failed:', error);
      throw new NotFoundException('Failed to get user stats');
    }
  }

  // Controlla se un utente segue un altro
  async checkFollowStatus(
    followerId: string,
    followingId: string
  ): Promise<{ isFollowing: boolean }> {
    console.log('🚀 [SocialGraphService] Check follow status request:', {
      followerId,
      followingId,
    });

    try {
      const isFollowing = await this.neo4jRepository.isFollowing(
        followerId,
        followingId
      );

      const result = { isFollowing };
      console.log('✅ [SocialGraphService] Follow status checked:', result);
      return result;
    } catch (error) {
      console.error(
        '❌ [SocialGraphService] Check follow status failed:',
        error
      );
      throw new BadRequestException('Failed to check follow status');
    }
  }

  // Metodi di utilità per debugging
  async getAllUsers(): Promise<UserNode[]> {
    console.log('🔧 [SocialGraphService] Getting all users for debugging');
    return await this.neo4jRepository.getAllUsers();
  }

  async getAllRelationships(): Promise<any[]> {
    console.log(
      '🔧 [SocialGraphService] Getting all relationships for debugging'
    );
    return await this.neo4jRepository.getAllRelationships();
  }

  async debugInfo(): Promise<any> {
    console.log('🔧 [SocialGraphService] Getting debug info');

    const [users, relationships] = await Promise.all([
      this.getAllUsers(),
      this.getAllRelationships(),
    ]);

    const debugInfo = {
      totalUsers: users.length,
      totalRelationships: relationships.length,
      users,
      relationships,
    };

    console.log('🔧 [SocialGraphService] Debug info:', debugInfo);
    return debugInfo;
  }
}
