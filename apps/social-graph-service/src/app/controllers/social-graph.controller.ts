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
import { GetFollowersDto } from '../dto/get-followers.dto';

@Controller()
export class SocialGraphController {
  constructor(private socialGraphService: SocialGraphService) {}

  // POST /sync-user - Sincronizza utente dal user-service
  @Post('sync-user')
  async syncUser(
    @Body() body: { userId: string; username: string; email: string }
  ) {
    console.log('🎯 [Controller] POST /sync-user called with:', body);

    try {
      const result = await this.socialGraphService.syncUserFromUserService(
        body.userId,
        body.username,
        body.email
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
  async unfollowUser(
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string
  ) {
    console.log('🎯 [Controller] DELETE /follow called with:', {
      followerId,
      followingId,
    });

    try {
      const result = await this.socialGraphService.unfollowUser(
        followerId,
        followingId
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
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    console.log('🎯 [Controller] GET /followers called with:', {
      userId,
      limit,
      offset,
      limitType: typeof limit, // Debug: vedi che tipo è
    });

    try {
      // CONVERTI DIRETTAMENTE QUI invece di usare il DTO
      const limitNumber = limit ? parseInt(limit, 10) : 50;
      const offsetNumber = offset ? parseInt(offset, 10) : 0;

      console.log('🔧 [Controller] Converted parameters:', {
        limitNumber,
        offsetNumber,
        limitType: typeof limitNumber,
        offsetType: typeof offsetNumber,
      });

      // Chiama direttamente il service con i numeri convertiti
      const result = await this.socialGraphService.getFollowers({
        userId,
        limit: limit || '50',
      });

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
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    console.log('🎯 [Controller] GET /following called with:', {
      userId,
      limit,
      offset,
      limitType: typeof limit, // Debug: vedi che tipo è
    });

    try {
      const limitNumber = limit ? parseInt(limit, 10) : 50;
      const offsetNumber = offset ? parseInt(offset, 10) : 0;

      console.log('🔧 [Controller] Converted parameters:', {
        limitNumber,
        offsetNumber,
        limitType: typeof limitNumber,
        offsetType: typeof offsetNumber,
      });

      const result = await this.socialGraphService.getFollowing(
        userId,
        limitNumber
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
    @Param('followerId') followerId: string,
    @Param('followingId') followingId: string
  ) {
    console.log('🎯 [Controller] GET /check-follow called with:', {
      followerId,
      followingId,
    });

    try {
      const result = await this.socialGraphService.checkFollowStatus(
        followerId,
        followingId
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

  // Health check
  @Get('health')
  async healthCheck() {
    console.log('🎯 [Controller] GET /health called');
    return {
      status: 'OK',
      service: 'social-graph-service',
      timestamp: new Date().toISOString(),
    };
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
