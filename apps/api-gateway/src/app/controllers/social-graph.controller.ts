import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  Request,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { MicroserviceService } from '../services/microservice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FollowUserDto } from '../dto/social-graph/follow-user.dto';
import { SyncUserDto } from '../dto/social-graph/sync-user.dto';
import { PaginationQueryDto } from '../dto/social-graph/pagination-query.dto';

@Controller('social')
export class SocialGraphController {
  constructor(private readonly microserviceService: MicroserviceService) {}

  /**
   * POST /api/social/sync-user
   * Sincronizza utente nel social graph (interno, chiamato quando si crea/aggiorna un utente)
   */
  @Post('sync-user')
  async syncUser(@Body(ValidationPipe) syncUserDto: SyncUserDto) {
    console.log('🔄 Syncing user in social graph:', syncUserDto);

    return await this.microserviceService.post(
      'socialGraph',
      '/sync-user',
      syncUserDto
    );
  }

  /**
   * POST /api/social/follow
   * Segui un utente (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Post('follow')
  async followUser(
    @Request() req,
    @Body(ValidationPipe) followUserDto: FollowUserDto
  ) {
    const userId = req.user.userId;
    console.log(
      '👥 User',
      userId,
      'following user',
      followUserDto.targetUserId
    );

    const servicePayload = {
      followerId: userId,
      followingId: followUserDto.targetUserId,
    };

    return await this.microserviceService.post(
      'socialGraph',
      '/follow',
      servicePayload
    );
  }

  /**
   * DELETE /api/social/follow/:targetUserId
   * Smetti di seguire un utente (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Delete('follow/:targetUserId')
  async unfollowUser(
    @Request() req,
    @Param('targetUserId') targetUserId: string
  ) {
    const userId = req.user.userId;
    console.log('👥 User', userId, 'unfollowing user', targetUserId);

    return await this.microserviceService.delete(
      'socialGraph',
      `/follow/${userId}/${targetUserId}`
    );
  }

  /**
   * GET /api/social/followers/me
   * Ottieni i propri follower (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get('followers/me')
  async getMyFollowers(
    @Request() req,
    @Query(ValidationPipe) queryDto: PaginationQueryDto
  ) {
    const userId = req.user.userId;
    console.log('👥 Getting my followers:', userId, 'with params:', queryDto);

    try {
      // Costruisci query params solo se forniti
      const queryParams: any = {};
      if (queryDto.limit !== undefined)
        queryParams.limit = queryDto.limit.toString();
      if (queryDto.offset !== undefined)
        queryParams.offset = queryDto.offset.toString();

      return await this.microserviceService.get(
        'socialGraph',
        `/followers/${userId}`,
        queryParams
      );
    } catch (error) {
      console.error('❌ Error getting my followers:', error);
      throw error;
    }
  }

  /**
   * GET /api/social/following/me
   * Ottieni gli utenti che segui (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get('following/me')
  async getMyFollowing(
    @Request() req,
    @Query(ValidationPipe) queryDto: PaginationQueryDto
  ) {
    const userId = req.user.userId;
    console.log('👥 Getting my following:', userId, 'with params:', queryDto);

    try {
      const queryParams: any = {};
      if (queryDto.limit !== undefined)
        queryParams.limit = queryDto.limit.toString();
      if (queryDto.offset !== undefined)
        queryParams.offset = queryDto.offset.toString();

      return await this.microserviceService.get(
        'socialGraph',
        `/following/${userId}`,
        queryParams
      );
    } catch (error) {
      console.error('❌ Error getting my following:', error);
      throw error;
    }
  }

  /**
   * GET /api/social/followers/:userId
   * Ottieni i follower di un utente
   */
  @Get('followers/:userId')
  async getFollowers(
    @Param('userId') userId: string,
    @Query(ValidationPipe) queryDto: PaginationQueryDto
  ) {
    console.log(
      '👥 Getting followers for user:',
      userId,
      'with params:',
      queryDto
    );

    try {
      const queryParams: any = {};
      if (queryDto.limit !== undefined)
        queryParams.limit = queryDto.limit.toString();
      if (queryDto.offset !== undefined)
        queryParams.offset = queryDto.offset.toString();

      return await this.microserviceService.get(
        'socialGraph',
        `/followers/${userId}`,
        queryParams
      );
    } catch (error) {
      console.error('❌ Error getting followers for user', userId, ':', error);
      throw error;
    }
  }

  /**
   * GET /api/social/following/:userId
   * Ottieni gli utenti seguiti da un utente
   */
  @Get('following/:userId')
  async getFollowing(
    @Param('userId') userId: string,
    @Query(ValidationPipe) queryDto: PaginationQueryDto
  ) {
    console.log(
      '👥 Getting following for user:',
      userId,
      'with params:',
      queryDto
    );

    try {
      const queryParams: any = {};
      if (queryDto.limit !== undefined)
        queryParams.limit = queryDto.limit.toString();
      if (queryDto.offset !== undefined)
        queryParams.offset = queryDto.offset.toString();

      return await this.microserviceService.get(
        'socialGraph',
        `/following/${userId}`,
        queryParams
      );
    } catch (error) {
      console.error('❌ Error getting following for user', userId, ':', error);
      throw error;
    }
  }

  /**
   * GET /api/social/relationship/:targetUserId
   * Verifica la relazione con un altro utente (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get('relationship/:targetUserId')
  async getRelationship(
    @Request() req,
    @Param('targetUserId') targetUserId: string
  ) {
    const userId = req.user.userId;
    console.log(
      '👥 Checking relationship between',
      userId,
      'and',
      targetUserId
    );

    try {
      return await this.microserviceService.get(
        'socialGraph',
        `/check-follow/${userId}/${targetUserId}`
      );
    } catch (error) {
      console.error('❌ Error checking relationship:', error);
      throw error;
    }
  }

  /**
   * GET /api/social/stats/:userId
   * Ottieni statistiche sociali di un utente (follower/following count)
   */
  @Get('stats/:userId')
  async getSocialStats(@Param('userId') userId: string) {
    console.log('📊 Getting social stats for user:', userId);

    try {
      return await this.microserviceService.get(
        'socialGraph',
        `/stats/${userId}`
      );
    } catch (error) {
      console.error(
        '❌ Error getting social stats for user',
        userId,
        ':',
        error
      );
      throw error;
    }
  }

  /**
   * @TODO da implementare
   * GET /api/social/suggestions
   * Ottieni suggerimenti di utenti da seguire (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get('suggestions')
  async getFollowSuggestions(
    @Request() req,
    @Query(ValidationPipe) queryDto: PaginationQueryDto
  ) {
    const userId = req.user.userId;
    console.log(
      '💡 Getting follow suggestions for user:',
      userId,
      'with params:',
      queryDto
    );

    return {
      message: 'Follow suggestions not yet implemented',
      suggestions: [],
    };
  }
}
