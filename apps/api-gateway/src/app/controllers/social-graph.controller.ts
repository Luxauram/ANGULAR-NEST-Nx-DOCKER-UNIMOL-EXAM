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
} from '@nestjs/common';
import { MicroserviceService } from '../services/microservice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FollowUserDto } from '../dto/social-graph/follower-user.dto';

@Controller('social')
export class SocialGraphController {
  constructor(private readonly microserviceService: MicroserviceService) {}

  /**
   * POST /api/social/sync-user
   * Sincronizza utente nel social graph (interno, chiamato quando si crea/aggiorna un utente)
   */
  @Post('sync-user')
  async syncUser(
    @Body() body: { userId: string; username: string; email: string }
  ) {
    console.log('🔄 Syncing user in social graph:', body);

    return await this.microserviceService.post(
      'socialGraph',
      '/sync-user',
      body
    );
  }

  /**
   * POST /api/social/follow
   * Segui un utente (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Post('follow')
  async followUser(@Request() req, @Body() followUserDto: FollowUserDto) {
    const userId = req.user.userId;
    console.log(
      '👥 User',
      userId,
      'following user',
      followUserDto.targetUserId
    );

    return await this.microserviceService.post('socialGraph', '/follow', {
      followerId: userId,
      followingId: followUserDto.targetUserId,
    });
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

  // ========================================================================
  // ROTTE SPECIFICHE "ME" - DEVONO ESSERE PRIMA DELLE ROTTE PARAMETRICHE!
  // ========================================================================

  /**
   * GET /api/social/followers/me
   * Ottieni i propri follower (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get('followers/me')
  async getMyFollowers(
    @Request() req,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const userId = req.user.userId;
    console.log('👥 Getting my followers:', userId);

    const queryParams: any = {};
    if (limit) queryParams.limit = limit;
    if (offset) queryParams.offset = offset;

    try {
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
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    const userId = req.user.userId;
    console.log('👥 Getting my following:', userId);

    const queryParams: any = {};
    if (limit) queryParams.limit = limit;
    if (offset) queryParams.offset = offset;

    try {
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

  // ========================================================================
  // ROTTE PARAMETRICHE - DEVONO ESSERE DOPO LE ROTTE SPECIFICHE!
  // ========================================================================

  /**
   * GET /api/social/followers/:userId
   * Ottieni i follower di un utente
   */
  @Get('followers/:userId')
  async getFollowers(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    console.log('👥 Getting followers for user:', userId);

    const queryParams: any = {};
    if (limit) queryParams.limit = limit;
    if (offset) queryParams.offset = offset;

    try {
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
    @Query('limit') limit?: string,
    @Query('offset') offset?: string
  ) {
    console.log('👥 Getting following for user:', userId);

    const queryParams: any = {};
    if (limit) queryParams.limit = limit;
    if (offset) queryParams.offset = offset;

    try {
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
   * GET /api/social/suggestions
   * Ottieni suggerimenti di utenti da seguire (protetto)
   * NOTA: Questa funzionalità non è ancora implementata nel social-graph-service
   */
  @UseGuards(JwtAuthGuard)
  @Get('suggestions')
  async getFollowSuggestions(@Request() req, @Query('limit') limit?: string) {
    const userId = req.user.userId;
    console.log('💡 Getting follow suggestions for user:', userId);

    // Questa funzionalità dovrebbe essere implementata nel social-graph-service
    // Per ora restituiamo un messaggio di "non implementato"
    return {
      message: 'Follow suggestions not yet implemented',
      suggestions: [],
    };
  }
}
