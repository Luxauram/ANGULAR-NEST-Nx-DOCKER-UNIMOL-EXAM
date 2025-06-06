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
      this.logger.log(
        `Richiesta feed per utente ${userId} (limit: ${limit}, offset: ${offset})`
      );

      // 1. Prova a recuperare da cache
      let feed = await this.redisService.getFeed(userId, limit, offset);

      if (feed) {
        this.logger.log(
          `Feed recuperato da cache per utente ${userId} - ${feed.items.length} items`
        );
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
        this.logger.warn(`Impossibile generare feed per utente ${userId}`);
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

  // Timeline cronologica dell'utente (tutti i post recenti degli utenti seguiti)
  async getTimeline(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<UserFeed> {
    try {
      this.logger.log(`Generazione timeline per utente ${userId}`);

      // Per ora usa la stessa logica del feed, ma potremmo differenziare
      // La timeline potrebbe includere più post o avere una logica diversa
      const timeline = await this.getFeed(userId, limit, offset);

      return {
        ...timeline,
        // Potremmo aggiungere metadata specifici per timeline
      };
    } catch (error) {
      this.logger.error(
        `Errore generando timeline per utente ${userId}:`,
        error
      );
      throw error;
    }
  }

  // Post in tendenza (trending)
  async getTrending(
    limit: number = 10,
    timeframe: string = '24h'
  ): Promise<{ items: FeedItem[]; timeframe: string; totalItems: number }> {
    try {
      this.logger.log(
        `Recupero trending posts (${timeframe}, limit: ${limit})`
      );

      // Recupera post trending dal post service
      const trendingPostsData = await this.externalApiService.getTrendingPosts(
        limit,
        timeframe
      );

      // Trasforma in FeedItem con dettagli utente
      const feedItems: FeedItem[] = [];

      for (const post of trendingPostsData) {
        const userDetails = await this.externalApiService.getUserDetails(
          post.userId || post.authorId
        );

        if (userDetails) {
          feedItems.push({
            postId: post.id || post._id,
            userId: userDetails.id,
            username: userDetails.username,
            content: post.content,
            createdAt: new Date(post.createdAt),
            updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
          });
        }
      }

      // Ordina per data più recente
      feedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      this.logger.log(`Recuperati ${feedItems.length} trending posts`);

      return {
        items: feedItems,
        timeframe,
        totalItems: feedItems.length,
      };
    } catch (error) {
      this.logger.error(`Errore recuperando trending posts:`, error);
      // Ritorna array vuoto invece di throw per non bloccare l'app
      return {
        items: [],
        timeframe,
        totalItems: 0,
      };
    }
  }

  // Post più recenti (da tutti gli utenti)
  async getRecent(
    limit: number = 20,
    offset: number = 0
  ): Promise<{ items: FeedItem[]; total: number }> {
    try {
      this.logger.log(
        `Recupero post recenti (limit: ${limit}, offset: ${offset})`
      );

      // Recupera post recenti dal post service
      const recentPostsData = await this.externalApiService.getRecentPosts(
        limit,
        offset
      );

      // Trasforma in FeedItem con dettagli utente
      const feedItems: FeedItem[] = [];

      for (const post of recentPostsData) {
        const userDetails = await this.externalApiService.getUserDetails(
          post.userId || post.authorId
        );

        if (userDetails) {
          feedItems.push({
            postId: post.id || post._id,
            userId: userDetails.id,
            username: userDetails.username,
            content: post.content,
            createdAt: new Date(post.createdAt),
            updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
          });
        }
      }

      // Ordina per data più recente
      feedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      this.logger.log(`Recuperati ${feedItems.length} post recenti`);

      return {
        items: feedItems,
        total: feedItems.length, // TODO: implementare conteggio reale
      };
    } catch (error) {
      this.logger.error(`Errore recuperando post recenti:`, error);
      // Ritorna array vuoto invece di throw per non bloccare l'app
      return {
        items: [],
        total: 0,
      };
    }
  }

  // Aggiorna cache quando viene creato/modificato un post
  async updateCacheForPost(postId: string): Promise<void> {
    try {
      this.logger.log(`Aggiornamento cache per post ${postId}`);

      // 1. Recupera info sul post per ottenere l'autore
      const postDetails = await this.externalApiService.getPostDetails(postId);

      if (!postDetails) {
        this.logger.warn(`Post ${postId} non trovato`);
        return;
      }

      // 2. Invalida i feed dei followers dell'autore
      await this.handleNewPost(postDetails.userId);
    } catch (error) {
      this.logger.error(`Errore aggiornando cache per post ${postId}:`, error);
      // Non fare throw per non bloccare operazioni upstream
    }
  }

  // Aggiorna cache per cambi nelle relazioni sociali
  async updateCacheForSocialChange(userId: string): Promise<void> {
    try {
      this.logger.log(`Aggiornamento cache per cambi sociali utente ${userId}`);

      // Invalida il feed dell'utente che ha cambiato le relazioni
      await this.handleFollowChange(userId);
    } catch (error) {
      this.logger.error(
        `Errore aggiornando cache per cambi sociali ${userId}:`,
        error
      );
      // Non fare throw per non bloccare operazioni upstream
    }
  }

  // METODI ORIGINALI (mantenuti per compatibilità)

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

  // METODI HELPER PRIVATI

  // Recupera i post più recenti da tutti gli utenti (placeholder per trending/recent)
  private async getRecentPostsFromAllUsers(
    limit: number = 20,
    offset: number = 0
  ): Promise<FeedItem[]> {
    try {
      // TODO: Implementare chiamata al post service per ottenere post globali
      // Per ora restituiamo array vuoto come placeholder
      this.logger.warn(
        'getRecentPostsFromAllUsers non implementato - restituendo array vuoto'
      );
      return [];
    } catch (error) {
      this.logger.error('Errore recuperando post recenti globali:', error);
      return [];
    }
  }
}
