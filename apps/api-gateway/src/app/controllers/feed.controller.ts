import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  Request,
  ValidationPipe,
  UsePipes,
  Body,
} from '@nestjs/common';
import { MicroserviceService } from '../services/microservice.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetFeedDto } from '../dto/feed/get-feed.dto';
import { GetTimelineDto } from '../dto/feed/get-timeline.dto';
import { TrendingPostsDto } from '../dto/feed/trending-posts.dto';
import { RecentPostsDto } from '../dto/feed/recent-posts.dto';
import {
  FollowChangeWebhookDto,
  NewPostWebhookDto,
} from '../dto/feed/cache-update.dto';

@Controller('feed')
export class FeedController {
  constructor(private readonly microserviceService: MicroserviceService) {}

  /**
   * GET /api/feed
   * Ottieni il feed personalizzato dell'utente (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getUserFeed(@Request() req, @Query() query: GetFeedDto) {
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
   * Ottieni timeline cronologica (protetto)
   */
  @UseGuards(JwtAuthGuard)
  @Get('timeline')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTimeline(@Request() req, @Query() query: GetTimelineDto) {
    const userId = req.user.userId;
    console.log('⏰ Getting timeline for user:', userId);

    const queryParams = {
      userId,
      page: query.page || 1,
      limit: query.limit || 20,
    };

    return await this.microserviceService.get(
      'feed',
      '/feed/timeline',
      queryParams
    );
  }

  /**
   * GET /api/feed/trending
   * Ottieni post in tendenza (pubblico)
   */
  @Get('trending')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTrendingPosts(@Query() query: TrendingPostsDto) {
    console.log('🔥 Getting trending posts');

    const queryParams = {
      limit: query.limit || 10,
      timeframe: query.timeframe || '24h',
    };

    return await this.microserviceService.get(
      'feed',
      '/feed/trending',
      queryParams
    );
  }

  /**
   * GET /api/feed/recent
   * Ottieni post più recenti (pubblico)
   */
  @Get('recent')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRecentPosts(@Query() query: RecentPostsDto) {
    console.log('🆕 Getting recent posts');

    return await this.microserviceService.get('feed', '/feed/recent', {
      page: query.page || 1,
      limit: query.limit || 10,
    });
  }

  /**
   * POST /api/feed/update-cache/:postId
   * Aggiorna cache quando viene creato/modificato un post
   */
  @Post('update-cache/:postId')
  async updateCacheForPost(@Param('postId') postId: string) {
    console.log('🔄 Updating cache for post:', postId);

    return await this.microserviceService.post(
      'feed',
      `/feed/update-cache/${postId}`,
      {}
    );
  }

  /**
   * POST /api/feed/update-social/:userId
   * Aggiorna cache per cambiamenti sociali
   */
  @Post('update-social/:userId')
  async updateCacheForSocialChange(@Param('userId') userId: string) {
    console.log('🔄 Updating cache for social changes of user:', userId);

    return await this.microserviceService.post(
      'feed',
      `/feed/update-social/${userId}`,
      {}
    );
  }

  /**
   * WEBHOOK ENDPOINTS
   */

  /**
   * POST /api/feed/webhook/new-post
   * Webhook per notificare nuovo post
   */
  @Post('webhook/new-post')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleNewPostWebhook(@Body() body: NewPostWebhookDto) {
    console.log('🔔 New post webhook received');

    return await this.microserviceService.post(
      'feed',
      `/feed/webhook/new-post`,
      body
    );
  }

  /**
   * POST /api/feed/webhook/follow-change
   * Webhook per notificare cambiamento follow/unfollow
   */
  @Post('webhook/follow-change')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleFollowChangeWebhook(@Body() body: FollowChangeWebhookDto) {
    console.log('🔔 Follow change webhook received');

    return await this.microserviceService.post(
      'feed',
      `/feed/webhook/follow-change`,
      body
    );
  }
}
