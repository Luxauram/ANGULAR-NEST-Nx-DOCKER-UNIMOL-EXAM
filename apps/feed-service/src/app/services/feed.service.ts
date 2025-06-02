/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ExternalApiService } from './external-api.service';
import { UserFeed, FeedItem } from '../models/feed.model';

@Injectable()
export class FeedService {
  private readonly logger = new Logger(FeedService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly externalApiService: ExternalApiService
  ) {}

  // Recupera il feed di un utente (cache-first)
  async getFeed(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<UserFeed> {
    try {
      // 1. Prova a recuperare da cache
      let feed = await this.redisService.getFeed(userId, limit, offset);

      if (feed) {
        this.logger.log(`Feed recuperato da cache per utente ${userId}`);
        return feed;
      }

      // 2. Se non in cache, genera il feed
      this.logger.log(
        `Feed non in cache per utente ${userId}, generazione in corso...`
      );
      await this.refreshFeed(userId);

      // 3. Recupera di nuovo da cache
      feed = await this.redisService.getFeed(userId, limit, offset);

      if (!feed) {
        // Se ancora non c'è, ritorna feed vuoto
        return {
          userId,
          items: [],
          lastUpdated: new Date(),
          totalItems: 0,
        };
      }

      return feed;
    } catch (error) {
      this.logger.error(`Errore recuperando feed per utente ${userId}:`, error);
      throw error;
    }
  }

  // Rigenera il feed dell'utente
  async refreshFeed(userId: string): Promise<void> {
    try {
      this.logger.log(`Rigenerazione feed per utente ${userId}`);

      // 1. Genera i nuovi item del feed
      const feedItems = await this.externalApiService.generateFeedItems(userId);

      // 2. Salva in cache
      await this.redisService.saveFeed(userId, feedItems);

      this.logger.log(
        `Feed aggiornato per utente ${userId}: ${feedItems.length} items`
      );
    } catch (error) {
      this.logger.error(`Errore rigenerando feed per utente ${userId}:`, error);
      throw error;
    }
  }

  // Invalida il feed dell'utente
  async invalidateFeed(userId: string): Promise<void> {
    try {
      await this.redisService.invalidateFeed(userId);
      this.logger.log(`Feed invalidato per utente ${userId}`);
    } catch (error) {
      this.logger.error(`Errore invalidando feed per utente ${userId}:`, error);
      throw error;
    }
  }

  // Metodo chiamato quando un utente posta (invalida i feed dei suoi followers)
  async handleNewPost(authorId: string): Promise<void> {
    try {
      this.logger.log(
        `Nuovo post da utente ${authorId}, invalidazione feed followers`
      );

      // 1. Recupera i followers dell'autore
      const followers = await this.externalApiService.getFollowers(authorId);

      if (followers.length === 0) {
        this.logger.log(`Utente ${authorId} non ha followers`);
        return;
      }

      // 2. Invalida i feed dei followers
      await this.redisService.invalidateMultipleFeeds(followers);

      this.logger.log(
        `Feed invalidati per ${followers.length} followers di ${authorId}`
      );
    } catch (error) {
      this.logger.error(`Errore gestendo nuovo post da ${authorId}:`, error);
      // Non facciamo throw per non bloccare la pubblicazione del post
    }
  }

  // Metodo chiamato quando un utente segue/smette di seguire qualcuno
  async handleFollowChange(userId: string): Promise<void> {
    try {
      this.logger.log(
        `Cambio di follow per utente ${userId}, invalidazione feed`
      );

      // Invalida il feed dell'utente che ha cambiato i suoi seguiti
      await this.redisService.invalidateFeed(userId);

      this.logger.log(
        `Feed invalidato per utente ${userId} dopo cambio follow`
      );
    } catch (error) {
      this.logger.error(`Errore gestendo cambio follow per ${userId}:`, error);
    }
  }

  // Statistiche del feed (per debug/monitoraggio)
  async getFeedStats(userId: string): Promise<{
    cached: boolean;
    totalItems: number;
    lastUpdated: Date | null;
  }> {
    try {
      const feed = await this.redisService.getFeed(userId, 1, 0);

      return {
        cached: feed !== null,
        totalItems: feed?.totalItems || 0,
        lastUpdated: feed?.lastUpdated || null,
      };
    } catch (error) {
      this.logger.error(
        `Errore recuperando stats per utente ${userId}:`,
        error
      );
      return {
        cached: false,
        totalItems: 0,
        lastUpdated: null,
      };
    }
  }
}
