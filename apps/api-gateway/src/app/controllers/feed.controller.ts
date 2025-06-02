import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { MicroserviceService } from '../services/microservice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('feed')
export class FeedController {
  constructor(private readonly microserviceService: MicroserviceService) {}

  /**
   * GET /api/feed
   * Ottieni il feed personalizzato dell'utente (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  async getUserFeed(
    @Request() req,
    @Query() query: { page?: number; limit?: number }
  ) {
    const userId = req.user.userId;
    console.log('📰 Getting feed for user:', userId);

    const queryParams = {
      userId,
      page: query.page || 1,
      limit: query.limit || 10,
    };

    return await this.microserviceService.get('feed', '/feed', queryParams);
  }

  /**
   * POST /api/feed/refresh
   * Forza il refresh del feed utente (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refreshUserFeed(@Request() req) {
    const userId = req.user.userId;
    console.log('🔄 Refreshing feed for user:', userId);

    return await this.microserviceService.post('feed', '/feed/refresh', {
      userId,
    });
  }

  /**
   * DELETE /api/feed/cache
   * Pulisci cache del feed utente (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Delete('cache')
  async clearFeedCache(@Request() req) {
    const userId = req.user.userId;
    console.log('🗑️ Clearing feed cache for user:', userId);

    return await this.microserviceService.delete(
      'feed',
      `/feed/cache/${userId}`
    );
  }

  /**
   * GET /api/feed/timeline
   * Ottieni timeline cronologica (tutti i post recenti) (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get('timeline')
  async getTimeline(
    @Request() req,
    @Query() query: { page?: number; limit?: number }
  ) {
    const userId = req.user.userId;
    console.log('⏰ Getting timeline for user:', userId);

    const queryParams = {
      userId,
      page: query.page || 1,
      limit: query.limit || 20,
    };

    return await this.microserviceService.get('feed', '/timeline', queryParams);
  }

  /**
   * GET /api/feed/trending
   * Ottieni post in tendenza (pubblico)
   */
  @Get('trending')
  async getTrendingPosts(
    @Query() query: { limit?: number; timeframe?: string }
  ) {
    console.log('🔥 Getting trending posts');

    const queryParams = {
      limit: query.limit || 10,
      timeframe: query.timeframe || '24h', // 24h, 7d, 30d
    };

    return await this.microserviceService.get('feed', '/trending', queryParams);
  }

  /**
   * GET /api/feed/recent
   * Ottieni post più recenti (pubblico)
   */
  @Get('recent')
  async getRecentPosts(@Query() query: { page?: number; limit?: number }) {
    console.log('🆕 Getting recent posts');

    return await this.microserviceService.get('feed', '/recent', query);
  }

  /**
   * POST /api/feed/update-cache/:postId
   * Aggiorna cache quando viene creato/modificato un post
   * (Questo endpoint sarà chiamato dagli altri microservizi)
   */
  @Post('update-cache/:postId')
  async updateCacheForPost(@Param('postId') postId: string) {
    console.log('🔄 Updating cache for post:', postId);

    return await this.microserviceService.post(
      'feed',
      `/update-cache/${postId}`,
      {}
    );
  }

  /**
   * POST /api/feed/update-social/:userId
   * Aggiorna cache quando cambiano le relazioni sociali
   * (Questo endpoint sarà chiamato dal Social Graph Service)
   */
  @Post('update-social/:userId')
  async updateCacheForSocialChange(@Param('userId') userId: string) {
    console.log('🔄 Updating cache for social changes of user:', userId);

    return await this.microserviceService.post(
      'feed',
      `/update-social/${userId}`,
      {}
    );
  }
}
