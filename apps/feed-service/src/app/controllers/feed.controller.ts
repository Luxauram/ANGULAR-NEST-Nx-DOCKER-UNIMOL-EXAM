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
} from '@nestjs/common';
import { FeedService } from '../services/feed.service';
import {
  GetFeedDto,
  RefreshFeedDto,
  TrendingPostsDto,
  RecentPostsDto,
} from '../dto/get-feed.dto';

@Controller('feed')
export class FeedController {
  private readonly logger = new Logger(FeedController.name);

  constructor(private readonly feedService: FeedService) {}

  @Get('health')
  @HttpCode(HttpStatus.OK)
  getHealth() {
    return {
      status: 'ok',
      service: 'feed-service',
      timestamp: new Date().toISOString(),
    };
  }

  // GET /feed - Recupera il feed dell'utente (chiamato dall'API Gateway)
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getFeed(@Query() query: GetFeedDto) {
    try {
      this.logger.log(`Richiesta feed per utente ${query.userId}`);

      // Converte page in offset per compatibilità
      const pageNum = query.page || 1;
      const limitNum = query.limit || 10;
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

  // POST /feed/refresh - Rigenera il feed dell'utente (chiamato dall'API Gateway)
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

  // DELETE /feed/cache/:userId - Invalida il feed dell'utente (chiamato dall'API Gateway)
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

  // GET /timeline - Timeline cronologica per l'utente
  @Get('timeline')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTimeline(@Query() query: GetFeedDto) {
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

  // GET /trending - Post in tendenza
  @Get('trending')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTrending(
    @Query('limit') limit?: number,
    @Query('timeframe') timeframe?: string
  ) {
    try {
      this.logger.log('Richiesta trending posts');

      const limitNum = limit || 10;
      const timeframeStr = timeframe || '24h';

      const trending = await this.feedService.getTrending(
        limitNum,
        timeframeStr
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

  // GET /recent - Post più recenti
  @Get('recent')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRecent(
    @Query('page') page?: number,
    @Query('limit') limit?: number
  ) {
    try {
      this.logger.log('Richiesta recent posts');

      const pageNum = page || 1;
      const limitNum = limit || 20;
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

  // ????? ENDPOINTS ORIGINALI (per compatibilità con eventuali chiamate dirette)

  // GET /feed/:userId - Recupera il feed dell'utente (endpoint originale)
  // @Get(':userId')
  // @UsePipes(new ValidationPipe({ transform: true }))
  // async getFeedByParam(
  //   @Param('userId') userId: string,
  //   @Query('limit') limit?: number,
  //   @Query('offset') offset?: number
  // ) {
  //   try {
  //     this.logger.log(
  //       `Richiesta feed per utente ${userId} (endpoint originale)`
  //     );

  //     const feed = await this.feedService.getFeed(
  //       userId,
  //       limit || 20,
  //       offset || 0
  //     );

  //     return {
  //       success: true,
  //       data: feed,
  //     };
  //   } catch (error) {
  //     this.logger.error(`Errore recuperando feed per ${userId}:`, error);
  //     throw error;
  //   }
  // }

  // POST /feed/:userId/refresh - Rigenera il feed dell'utente (endpoint originale)
  // @Post(':userId/refresh')
  // @HttpCode(HttpStatus.OK)
  // async refreshFeedByParam(@Param('userId') userId: string) {
  //   try {
  //     this.logger.log(
  //       `Richiesta refresh feed per utente ${userId} (endpoint originale)`
  //     );

  //     await this.feedService.refreshFeed(userId);

  //     return {
  //       success: true,
  //       message: 'Feed rigenerato con successo',
  //       timestamp: new Date().toISOString(),
  //     };
  //   } catch (error) {
  //     this.logger.error(`Errore refresh feed per ${userId}:`, error);
  //     throw error;
  //   }
  // }

  // DELETE /feed/:userId - Invalida il feed dell'utente (endpoint originale)
  // @Delete(':userId')
  // @HttpCode(HttpStatus.OK)
  // async invalidateFeedByParam(@Param('userId') userId: string) {
  //   try {
  //     this.logger.log(
  //       `Richiesta invalidazione feed per utente ${userId} (endpoint originale)`
  //     );

  //     await this.feedService.invalidateFeed(userId);

  //     return {
  //       success: true,
  //       message: 'Feed invalidato con successo',
  //       timestamp: new Date().toISOString(),
  //     };
  //   } catch (error) {
  //     this.logger.error(`Errore invalidando feed per ${userId}:`, error);
  //     throw error;
  //   }
  // }

  // GET /feed/:userId/stats - Statistiche del feed (endpoint originale)
  // @Get(':userId/stats')
  // async getFeedStats(@Param('userId') userId: string) {
  //   try {
  //     const stats = await this.feedService.getFeedStats(userId);

  //     return {
  //       success: true,
  //       data: stats,
  //     };
  //   } catch (error) {
  //     this.logger.error(`Errore recuperando stats per ${userId}:`, error);
  //     throw error;
  //   }
  // }

  // WEBHOOK ENDPOINTS (per compatibilità con altri servizi)

  // POST /webhook/new-post - Webhook per nuovi post
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

  // POST /webhook/follow-change - Webhook per cambi di follow
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
