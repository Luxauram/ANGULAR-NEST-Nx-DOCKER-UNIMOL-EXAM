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

      if (!recentPostsData || recentPostsData.length === 0) {
        this.logger.log('Nessun post recente trovato');
        return { items: [], total: 0 };
      }

      // Trasforma in FeedItem con dettagli utente - MIGLIORATO
      const feedItems: FeedItem[] = [];
      const userDetailsCache = new Map<string, any>();

      for (const post of recentPostsData) {
        const userId = post.userId || post.authorId;

        // Validazione ID utente
        if (!userId || typeof userId !== 'string' || userId.length !== 36) {
          this.logger.warn(`Post ${post.id} ha userId non valido: ${userId}`);
          continue;
        }

        // Cache dei dettagli utente per evitare chiamate duplicate
        let userDetails = userDetailsCache.get(userId);

        if (!userDetails) {
          try {
            userDetails = await this.externalApiService.getUserDetails(userId);
            if (userDetails) {
              userDetailsCache.set(userId, userDetails);
            }
          } catch (error) {
            this.logger.warn(
              `Impossibile recuperare dettagli per utente ${userId}: ${error.message}`
            );
            continue; // Salta questo post se l'utente non esiste
          }
        }

        if (userDetails) {
          try {
            feedItems.push({
              postId: post.id || post._id,
              userId: userDetails.id,
              username: userDetails.username,
              content: post.content,
              createdAt: new Date(post.createdAt),
              updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
            });
          } catch (error) {
            this.logger.warn(
              `Errore creando FeedItem per post ${post.id}: ${error.message}`
            );
          }
        }
      }

      // Ordina per data più recente
      feedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      this.logger.log(
        `Recuperati ${feedItems.length} post recenti validi su ${recentPostsData.length} totali`
      );

      return {
        items: feedItems,
        total: feedItems.length,
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

  // Post in tendenza
  async getTrending(
    limit: number = 10,
    timeframe: string = '24h'
  ): Promise<{ items: FeedItem[]; timeframe: string; totalItems: number }> {
    try {
      this.logger.log(
        `Recupero trending posts (${timeframe}, limit: ${limit})`
      );

      // Prova prima con cache
      const cacheKey = `trending:${timeframe}:${limit}`;
      const cached = await this.redisService.getGenericCache(cacheKey);

      if (cached) {
        this.logger.log('Trending posts recuperati da cache');
        return JSON.parse(cached);
      }

      // Recupera post trending dal post service
      const trendingPostsData = await this.externalApiService.getTrendingPosts(
        limit,
        timeframe
      );

      if (!trendingPostsData || trendingPostsData.length === 0) {
        this.logger.log('Nessun post trending trovato');
        const emptyResult = { items: [], timeframe, totalItems: 0 };
        // Salva risultato vuoto in cache per 5 minuti
        await this.redisService.setGenericCache(
          cacheKey,
          JSON.stringify(emptyResult),
          300
        );
        return emptyResult;
      }

      // Trasforma in FeedItem con dettagli utente - MIGLIORATO
      const feedItems: FeedItem[] = [];
      const userDetailsCache = new Map<string, any>();

      for (const post of trendingPostsData) {
        const userId = post.userId || post.authorId;

        // Validazione ID utente
        if (!userId || typeof userId !== 'string' || userId.length !== 36) {
          this.logger.warn(
            `Post trending ${post.id} ha userId non valido: ${userId}`
          );
          continue;
        }

        // Cache dei dettagli utente
        let userDetails = userDetailsCache.get(userId);

        if (!userDetails) {
          try {
            userDetails = await this.externalApiService.getUserDetails(userId);
            if (userDetails) {
              userDetailsCache.set(userId, userDetails);
            }
          } catch (error) {
            this.logger.warn(
              `Impossibile recuperare dettagli per utente ${userId}: ${error.message}`
            );
            continue;
          }
        }

        if (userDetails) {
          try {
            feedItems.push({
              postId: post.id || post._id,
              userId: userDetails.id,
              username: userDetails.username,
              content: post.content,
              createdAt: new Date(post.createdAt),
              updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
            });
          } catch (error) {
            this.logger.warn(
              `Errore creando FeedItem per post trending ${post.id}: ${error.message}`
            );
          }
        }
      }

      // Ordina per data più recente
      feedItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      const result = {
        items: feedItems,
        timeframe,
        totalItems: feedItems.length,
      };

      // Salva in cache per 10 minuti
      await this.redisService.setGenericCache(
        cacheKey,
        JSON.stringify(result),
        600
      );

      this.logger.log(
        `Recuperati ${feedItems.length} trending posts validi su ${trendingPostsData.length} totali`
      );
      return result;
    } catch (error) {
      this.logger.error(`Errore recuperando trending posts:`, error);
      return {
        items: [],
        timeframe,
        totalItems: 0,
      };
    }
  }

  // Recupera il feed di un utente (cache-first)
  async getFeed(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<UserFeed> {
    try {
      // Validazione userId
      if (!userId || typeof userId !== 'string' || userId.length !== 36) {
        throw new Error(`UserId non valido: ${userId}`);
      }

      this.logger.log(
        `Richiesta feed per utente ${userId} (limit: ${limit}, offset: ${offset})`
      );

      // 1. Prova a recuperare da cache
      let feed = await this.redisService.getFeed(userId, limit, offset);

      if (feed && feed.items.length > 0) {
        this.logger.log(
          `Feed recuperato da cache per utente ${userId} - ${feed.items.length} items`
        );
        return feed;
      }

      // 2. Se non in cache o vuoto, genera il feed
      this.logger.log(
        `Feed non in cache per utente ${userId}, generazione in corso...`
      );

      const feedItems = await this.externalApiService.generateFeedItems(userId);

      if (feedItems.length > 0) {
        await this.redisService.saveFeed(userId, feedItems);
      }

      // 3. Recupera di nuovo da cache con paginazione
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
      // Ritorna feed vuoto invece di throw
      return {
        userId,
        items: [],
        lastUpdated: new Date(),
        totalItems: 0,
      };
    }
  }

  // Rigenera il feed dell'utente
  async refreshFeed(userId: string): Promise<void> {
    try {
      // Validazione userId
      if (!userId || typeof userId !== 'string' || userId.length !== 36) {
        throw new Error(`UserId non valido: ${userId}`);
      }

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

  // Timeline cronologica dell'utente
  async getTimeline(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<UserFeed> {
    try {
      // Validazione userId
      if (!userId || typeof userId !== 'string' || userId.length !== 36) {
        throw new Error(`UserId non valido: ${userId}`);
      }

      this.logger.log(`Generazione timeline per utente ${userId}`);

      // Per ora usa la stessa logica del feed, ma potremmo differenziare
      const timeline = await this.getFeed(userId, limit, offset);

      return timeline;
    } catch (error) {
      this.logger.error(
        `Errore generando timeline per utente ${userId}:`,
        error
      );
      // Ritorna timeline vuota invece di throw
      return {
        userId,
        items: [],
        lastUpdated: new Date(),
        totalItems: 0,
      };
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
