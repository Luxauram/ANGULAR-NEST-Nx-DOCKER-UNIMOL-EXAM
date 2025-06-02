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

  // GET /feed/:userId - Recupera il feed dell'utente
  @Get(':userId')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getFeed(
    @Param('userId') userId: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number
  ) {
    try {
      this.logger.log(`Richiesta feed per utente ${userId}`);

      const feed = await this.feedService.getFeed(
        userId,
        limit || 20,
        offset || 0
      );

      return {
        success: true,
        data: feed,
      };
    } catch (error) {
      this.logger.error(`Errore recuperando feed per ${userId}:`, error);
      throw error;
    }
  }

  // POST /feed/:userId/refresh - Rigenera il feed dell'utente
  @Post(':userId/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshFeed(@Param('userId') userId: string) {
    try {
      this.logger.log(`Richiesta refresh feed per utente ${userId}`);

      await this.feedService.refreshFeed(userId);

      return {
        success: true,
        message: 'Feed rigenerato con successo',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Errore refresh feed per ${userId}:`, error);
      throw error;
    }
  }

  // DELETE /feed/:userId - Invalida il feed dell'utente
  @Delete(':userId')
  @HttpCode(HttpStatus.OK)
  async invalidateFeed(@Param('userId') userId: string) {
    try {
      this.logger.log(`Richiesta invalidazione feed per utente ${userId}`);

      await this.feedService.invalidateFeed(userId);

      return {
        success: true,
        message: 'Feed invalidato con successo',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Errore invalidando feed per ${userId}:`, error);
      throw error;
    }
  }

  // GET /feed/:userId/stats - Statistiche del feed
  @Get(':userId/stats')
  async getFeedStats(@Param('userId') userId: string) {
    try {
      const stats = await this.feedService.getFeedStats(userId);

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      this.logger.error(`Errore recuperando stats per ${userId}:`, error);
      throw error;
    }
  }

  // POST /feed/webhook/new-post - Webhook per nuovi post
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
      // Non fare throw per non bloccare il post service
      return {
        success: false,
        message: 'Errore elaborando webhook',
      };
    }
  }

  // POST /feed/webhook/follow-change - Webhook per cambi di follow
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
