import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  ValidationPipe,
  UsePipes,
  BadRequestException,
} from '@nestjs/common';
import { FeedService } from '../services/feed.service';
import { GetFeedDto } from '../dto/get-feed.dto';
import { RefreshFeedDto } from '../dto/refresh-feed.dto';
import { GetTimelineDto } from '../dto/get-timeline.dto';
import { TrendingPostsDto } from '../dto/trending-posts.dto';
import { RecentPostsDto } from '../dto/recent-posts.dto';
import { TimelineParamsDto } from '../dto/timeline-params.dto';

@Controller('feed')
export class FeedController {
  private readonly logger = new Logger(FeedController.name);

  constructor(private readonly feedService: FeedService) {}

  // GET /feed - Recupera il feed dell'utente (chiamato dall'API Gateway)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getFeed(@Query() query: GetFeedDto) {
    try {
      this.logger.log(`Richiesta feed per utente ${query.userId}`);

      // Converte page in offset per compatibilità
      const pageNum = query.page || 1;
      const limitNum = query.limit || 20;
      const offset = (pageNum - 1) * limitNum;

      const feed = await this.feedService.getFeed(
        query.userId,
        limitNum,
        offset
      );

      return {
        success: true,
        data: feed,
      };
    } catch (error) {
      this.logger.error(`Errore recuperando feed per ${query.userId}:`, error);
      throw error;
    }
  }

  // POST /feed/refresh - Rigenera il feed dell'utente
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async refreshFeed(@Body() body: RefreshFeedDto) {
    try {
      this.logger.log(`Richiesta refresh feed per utente ${body.userId}`);

      await this.feedService.refreshFeed(body.userId);

      return {
        success: true,
        message: 'Feed rigenerato con successo',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Errore refresh feed per ${body.userId}:`, error);
      throw error;
    }
  }

  // DELETE /feed/cache/:userId - Invalida il feed dell'utente
  @Delete('cache/:userId')
  @HttpCode(HttpStatus.OK)
  async clearFeedCache(@Param('userId') userId: string) {
    try {
      this.logger.log(`Richiesta pulizia cache feed per utente ${userId}`);

      await this.feedService.invalidateFeed(userId);

      return {
        success: true,
        message: 'Cache feed pulita con successo',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Errore pulendo cache feed per ${userId}:`, error);
      throw error;
    }
  }

  // GET /timeline/:userId - Timeline cronologica per l'utente (con userId obbligatorio nei path params)
  @Get('timeline/:userId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTimelineByUserId(
    @Param('userId') userId: string,
    @Query() query: TimelineParamsDto
  ) {
    try {
      this.logger.log(`Richiesta timeline per utente ${userId}`);

      const pageNum = query.page || 1;
      const limitNum = query.limit || 20;
      const offset = (pageNum - 1) * limitNum;

      const timeline = await this.feedService.getTimeline(
        userId,
        limitNum,
        offset
      );

      return {
        success: true,
        data: timeline,
      };
    } catch (error) {
      this.logger.error(`Errore recuperando timeline per ${userId}:`, error);
      throw error;
    }
  }

  // GET /timeline - Timeline con userId nei query params
  @Get('timeline')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTimeline(@Query() query: GetTimelineDto) {
    try {
      this.logger.log(`Richiesta timeline per utente ${query.userId}`);

      const pageNum = query.page || 1;
      const limitNum = query.limit || 20;
      const offset = (pageNum - 1) * limitNum;

      const timeline = await this.feedService.getTimeline(
        query.userId,
        limitNum,
        offset
      );

      return {
        success: true,
        data: timeline,
      };
    } catch (error) {
      this.logger.error(
        `Errore recuperando timeline per ${query.userId}:`,
        error
      );
      throw error;
    }
  }

  // GET /trending - Post in tendenza (non richiede userId)
  @Get('trending')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTrending(@Query() query: TrendingPostsDto) {
    try {
      this.logger.log('Richiesta trending posts');

      const trending = await this.feedService.getTrending(
        query.limit || 10,
        query.timeframe || '24h'
      );

      return {
        success: true,
        data: trending,
      };
    } catch (error) {
      this.logger.error('Errore recuperando trending posts:', error);
      throw error;
    }
  }

  // GET /recent - Post più recenti (non richiede userId)
  @Get('recent')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRecent(@Query() query: RecentPostsDto) {
    try {
      this.logger.log('Richiesta recent posts');

      const pageNum = query.page || 1;
      const limitNum = query.limit || 20;
      const offset = (pageNum - 1) * limitNum;

      const recent = await this.feedService.getRecent(limitNum, offset);

      return {
        success: true,
        data: recent,
      };
    } catch (error) {
      this.logger.error('Errore recuperando recent posts:', error);
      throw error;
    }
  }

  // POST /update-cache/:postId - Aggiorna cache per nuovo post
  @Post('update-cache/:postId')
  @HttpCode(HttpStatus.OK)
  async updateCacheForPost(@Param('postId') postId: string) {
    try {
      this.logger.log(`Aggiornamento cache per nuovo post ${postId}`);

      await this.feedService.updateCacheForPost(postId);

      return {
        success: true,
        message: 'Cache aggiornata per nuovo post',
      };
    } catch (error) {
      this.logger.error(`Errore aggiornando cache per post ${postId}:`, error);
      return {
        success: false,
        message: 'Errore aggiornando cache',
      };
    }
  }

  // POST /update-social/:userId - Aggiorna cache per cambi sociali
  @Post('update-social/:userId')
  @HttpCode(HttpStatus.OK)
  async updateCacheForSocialChange(@Param('userId') userId: string) {
    try {
      this.logger.log(`Aggiornamento cache per cambi sociali utente ${userId}`);

      await this.feedService.updateCacheForSocialChange(userId);

      return {
        success: true,
        message: 'Cache aggiornata per cambi sociali',
      };
    } catch (error) {
      this.logger.error(
        `Errore aggiornando cache per utente ${userId}:`,
        error
      );
      return {
        success: false,
        message: 'Errore aggiornando cache',
      };
    }
  }

  // WEBHOOK ENDPOINTS
  @Post('webhook/new-post')
  @HttpCode(HttpStatus.OK)
  async handleNewPost(@Body() body: { authorId: string }) {
    try {
      this.logger.log(`Webhook nuovo post da utente ${body.authorId}`);

      await this.feedService.handleNewPost(body.authorId);

      return {
        success: true,
        message: 'Webhook elaborato con successo',
      };
    } catch (error) {
      this.logger.error(`Errore elaborando webhook nuovo post:`, error);
      return {
        success: false,
        message: 'Errore elaborando webhook',
      };
    }
  }

  @Post('webhook/follow-change')
  @HttpCode(HttpStatus.OK)
  async handleFollowChange(@Body() body: { userId: string }) {
    try {
      this.logger.log(`Webhook cambio follow per utente ${body.userId}`);

      await this.feedService.handleFollowChange(body.userId);

      return {
        success: true,
        message: 'Webhook elaborato con successo',
      };
    } catch (error) {
      this.logger.error(`Errore elaborando webhook follow change:`, error);
      return {
        success: false,
        message: 'Errore elaborando webhook',
      };
    }
  }
}
