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

// DTOs
export class FollowUserDto {
  targetUserId: string;
}

@Controller('social')
export class SocialGraphController {
  constructor(private readonly microserviceService: MicroserviceService) {}

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

  /**
   * GET /api/social/followers/:userId
   * Ottieni i follower di un utente
   */
  @Get('followers/:userId')
  async getFollowers(
    @Param('userId') userId: string,
    @Query() query: { limit?: number; offset?: number }
  ) {
    console.log('👥 Getting followers for user:', userId);

    return await this.microserviceService.get(
      'socialGraph',
      `/followers/${userId}`,
      query
    );
  }

  /**
   * GET /api/social/following/:userId
   * Ottieni gli utenti seguiti da un utente
   */
  @Get('following/:userId')
  async getFollowing(
    @Param('userId') userId: string,
    @Query() query: { limit?: number; offset?: number }
  ) {
    console.log('👥 Getting following for user:', userId);

    return await this.microserviceService.get(
      'socialGraph',
      `/following/${userId}`,
      query
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
    @Query() query: { limit?: number; offset?: number }
  ) {
    const userId = req.user.userId;
    console.log('👥 Getting my followers:', userId);

    return await this.microserviceService.get(
      'socialGraph',
      `/followers/${userId}`,
      query
    );
  }

  /**
   * GET /api/social/following/me
   * Ottieni gli utenti che segui (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get('following/me')
  async getMyFollowing(
    @Request() req,
    @Query() query: { limit?: number; offset?: number }
  ) {
    const userId = req.user.userId;
    console.log('👥 Getting my following:', userId);

    return await this.microserviceService.get(
      'socialGraph',
      `/following/${userId}`,
      query
    );
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

    return await this.microserviceService.get(
      'socialGraph',
      `/relationship/${userId}/${targetUserId}`
    );
  }

  /**
   * GET /api/social/stats/:userId
   * Ottieni statistiche sociali di un utente (follower/following count)
   */
  @Get('stats/:userId')
  async getSocialStats(@Param('userId') userId: string) {
    console.log('📊 Getting social stats for user:', userId);

    return await this.microserviceService.get(
      'socialGraph',
      `/stats/${userId}`
    );
  }

  /**
   * GET /api/social/suggestions
   * Ottieni suggerimenti di utenti da seguire (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get('suggestions')
  async getFollowSuggestions(
    @Request() req,
    @Query() query: { limit?: number }
  ) {
    const userId = req.user.userId;
    console.log('💡 Getting follow suggestions for user:', userId);

    return await this.microserviceService.get(
      'socialGraph',
      `/suggestions/${userId}`,
      query
    );
  }
}
