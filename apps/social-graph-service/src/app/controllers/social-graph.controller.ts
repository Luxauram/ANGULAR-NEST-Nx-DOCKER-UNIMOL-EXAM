import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SocialGraphService } from '../services/social-graph.service';
import { FollowUserDto } from '../dto/follow-user.dto';
import { SyncUserDto } from '../dto/sync-user.dto';
import { CheckFollowDto } from '../dto/check-follow.dto';
import { GetFollowersDto } from '../dto/get-followers.dto';

@Controller()
export class SocialGraphController {
  constructor(private socialGraphService: SocialGraphService) {}

  // POST /sync-user - Sincronizza utente dal user-service
  @Post('sync-user')
  async syncUser(@Body(ValidationPipe) syncUserDto: SyncUserDto) {
    console.log('🎯 [Controller] POST /sync-user called with:', syncUserDto);

    try {
      const result = await this.socialGraphService.syncUserFromUserService(
        syncUserDto.userId,
        syncUserDto.username,
        syncUserDto.email
      );
      console.log('✅ [Controller] User sync successful:', result);
      return result;
    } catch (error) {
      console.error('❌ [Controller] User sync failed:', error);
      throw new HttpException(
        'Failed to sync user with social graph',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // POST /follow - Segui un utente
  @Post('follow')
  async followUser(@Body(ValidationPipe) followUserDto: FollowUserDto) {
    console.log('🎯 [Controller] POST /follow called with:', followUserDto);

    try {
      const result = await this.socialGraphService.followUser(followUserDto);
      console.log('✅ [Controller] Follow operation result:', result);
      return result;
    } catch (error) {
      console.error('❌ [Controller] Follow operation failed:', error);
      throw new HttpException(
        error.message || 'Failed to follow user',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // DELETE /follow/:followerId/:followingId - Smetti di seguire
  @Delete('follow/:followerId/:followingId')
  async unfollowUser(@Param(ValidationPipe) checkFollowDto: CheckFollowDto) {
    console.log('🎯 [Controller] DELETE /follow called with:', checkFollowDto);

    try {
      const result = await this.socialGraphService.unfollowUser(
        checkFollowDto.followerId,
        checkFollowDto.followingId
      );
      console.log('✅ [Controller] Unfollow operation result:', result);
      return result;
    } catch (error) {
      console.error('❌ [Controller] Unfollow operation failed:', error);
      throw new HttpException(
        error.message || 'Failed to unfollow user',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // GET /followers/:userId - Ottieni followers
  @Get('followers/:userId')
  async getFollowers(
    @Param('userId') userId: string,
    @Query(ValidationPipe) query: Partial<GetFollowersDto>
  ) {
    console.log('🎯 [Controller] GET /followers called with:', {
      userId,
      query,
    });

    try {
      // Usa i valori default se non forniti
      const limit = query.limit ?? 50;
      const offset = query.offset ?? 0;

      console.log('🔧 [Controller] Using parameters:', {
        userId,
        limit,
        offset,
      });

      const result = await this.socialGraphService.getFollowers(
        userId,
        limit,
        offset
      );

      console.log(
        '✅ [Controller] Get followers result:',
        result.length,
        'followers'
      );
      return result;
    } catch (error) {
      console.error('❌ [Controller] Get followers failed:', error);
      throw new HttpException('Failed to get followers', HttpStatus.NOT_FOUND);
    }
  }

  // GET /following/:userId - Ottieni following
  @Get('following/:userId')
  async getFollowing(
    @Param('userId') userId: string,
    @Query(ValidationPipe) query: Partial<GetFollowersDto>
  ) {
    console.log('🎯 [Controller] GET /following called with:', {
      userId,
      query,
    });

    try {
      const limit = query.limit ?? 50;
      const offset = query.offset ?? 0;

      console.log('🔧 [Controller] Using parameters:', {
        userId,
        limit,
        offset,
      });

      const result = await this.socialGraphService.getFollowing(
        userId,
        limit,
        offset
      );
      console.log(
        '✅ [Controller] Get following result:',
        result.length,
        'following'
      );
      return result;
    } catch (error) {
      console.error('❌ [Controller] Get following failed:', error);
      throw new HttpException('Failed to get following', HttpStatus.NOT_FOUND);
    }
  }

  // GET /stats/:userId - Ottieni statistiche utente
  @Get('stats/:userId')
  async getUserStats(@Param('userId') userId: string) {
    console.log('🎯 [Controller] GET /stats called with:', { userId });

    try {
      const result = await this.socialGraphService.getUserStats(userId);
      console.log('✅ [Controller] Get stats result:', result);
      return result;
    } catch (error) {
      console.error('❌ [Controller] Get stats failed:', error);
      throw new HttpException('Failed to get user stats', HttpStatus.NOT_FOUND);
    }
  }

  // GET /check-follow/:followerId/:followingId - Controlla se segue
  @Get('check-follow/:followerId/:followingId')
  async checkFollowStatus(
    @Param(ValidationPipe) checkFollowDto: CheckFollowDto
  ) {
    console.log(
      '🎯 [Controller] GET /check-follow called with:',
      checkFollowDto
    );

    try {
      const result = await this.socialGraphService.checkFollowStatus(
        checkFollowDto.followerId,
        checkFollowDto.followingId
      );
      console.log('✅ [Controller] Check follow status result:', result);
      return result;
    } catch (error) {
      console.error('❌ [Controller] Check follow status failed:', error);
      throw new HttpException(
        'Failed to check follow status',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  // Debug endpoints
  @Get('debug/users')
  async debugUsers() {
    console.log('🔧 [Controller] GET /debug/users called');
    return await this.socialGraphService.getAllUsers();
  }

  @Get('debug/relationships')
  async debugRelationships() {
    console.log('🔧 [Controller] GET /debug/relationships called');
    return await this.socialGraphService.getAllRelationships();
  }

  @Get('debug/info')
  async debugInfo() {
    console.log('🔧 [Controller] GET /debug/info called');
    return await this.socialGraphService.debugInfo();
  }
}
