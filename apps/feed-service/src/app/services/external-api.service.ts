/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FeedItem } from '../models/feed.model';

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);

  private readonly USER_SERVICE_URL =
    process.env.USER_SERVICE_URL ||
    process.env.USER_SERVICE_DOCKER ||
    'http://host.docker.internal:3001';
  private readonly POST_SERVICE_URL =
    process.env.POST_SERVICE_URL ||
    process.env.POST_SERVICE_DOCKER ||
    'http://host.docker.internal:3002';
  private readonly SOCIAL_GRAPH_SERVICE_URL =
    process.env.SOCIAL_GRAPH_SERVICE_URL ||
    process.env.SOCIAL_GRAPH_SERVICE_DOCKER ||
    'http://host.docker.internal:3004';

  private userDetailsCache = new Map<
    string,
    { data: any; timestamp: number }
  >();
  private readonly CACHE_TTL = 5 * 60 * 1000;

  constructor(private readonly httpService: HttpService) {}

  // Recupera gli utenti seguiti da un utente
  async getFollowing(userId: string): Promise<string[]> {
    try {
      // Validazione input
      if (!userId || typeof userId !== 'string' || userId.length !== 36) {
        this.logger.error(`getFollowing: userId non valido: ${userId}`);
        return [];
      }

      const url = `${this.SOCIAL_GRAPH_SERVICE_URL}/following/${userId}`;
      this.logger.log(`Chiamata API: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 5000 })
      );

      // Gestisci diverse strutture di risposta
      const following =
        response.data?.data?.following ||
        response.data?.following ||
        response.data ||
        [];

      // Validazione e filtraggio degli ID
      const validFollowing = following.filter((id: any) => {
        if (!id || typeof id !== 'string' || id.length !== 36) {
          this.logger.warn(
            `Following ID non valido per utente ${userId}: ${id}`
          );
          return false;
        }
        return true;
      });

      this.logger.log(
        `Utente ${userId} segue ${validFollowing.length} persone valide`
      );
      return validFollowing;
    } catch (error) {
      this.logger.error(
        `Errore recuperando following per utente ${userId}:`,
        error.response?.data || error.message
      );
      return [];
    }
  }

  // Recupera i dettagli di un utente
  async getUserDetails(
    userId: string
  ): Promise<{ id: string; username: string; email?: string } | null> {
    try {
      // Validazione input
      if (!userId || typeof userId !== 'string') {
        this.logger.error(`getUserDetails: userId non valido: ${userId}`);
        return null;
      }

      if (Array.isArray(userId)) {
        this.logger.error(
          'getUserDetails ricevuto array invece di stringa!',
          userId
        );
        return null;
      }

      // Controlla cache
      const cached = this.userDetailsCache.get(userId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.data;
      }

      const url = `${this.USER_SERVICE_URL}/users/${userId}`;
      this.logger.log(`Chiamata API: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 5000 })
      );

      const userData = response.data?.data || response.data;

      const userDetails = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
      };

      // Salva in cache
      this.userDetailsCache.set(userId, {
        data: userDetails,
        timestamp: Date.now(),
      });

      return userDetails;
    } catch (error) {
      // Log diversificato per 404 vs altri errori
      if (error.response?.status === 404) {
        this.logger.warn(`Utente ${userId} non trovato (404)`);
      } else {
        this.logger.error(
          `Errore recuperando dettagli utente ${userId}:`,
          error.response?.data || error.message
        );
      }
      return null;
    }
  }

  // Recupera i post di un utente
  async getUserPosts(userId: string, limit: number = 50): Promise<any[]> {
    try {
      // Validazione input
      if (!userId || typeof userId !== 'string') {
        this.logger.error(`getUserPosts: userId non valido: ${userId}`);
        return [];
      }

      if (Array.isArray(userId)) {
        this.logger.error(
          'getUserPosts ricevuto array invece di stringa!',
          userId
        );
        return [];
      }

      const url = `${this.POST_SERVICE_URL}/posts/user/${userId}?limit=${limit}`;

      this.logger.log(`Chiamata API: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 10000 })
      );

      const posts = response.data?.data || response.data || [];
      this.logger.log(`Recuperati ${posts.length} post per utente ${userId}`);

      // Validazione post
      const validPosts = posts.filter((post) => {
        const postUserId = post.userId || post.authorId;
        if (
          !postUserId ||
          typeof postUserId !== 'string' ||
          postUserId.length !== 36
        ) {
          this.logger.warn(
            `Post con userId non valido: ${post.id} - ${postUserId}`
          );
          return false;
        }
        return true;
      });

      return validPosts;
    } catch (error) {
      this.logger.error(
        `Errore recuperando post per utente ${userId}:`,
        error.response?.data || error.message
      );
      return [];
    }
  }

  // Recupera i dettagli di un singolo post
  async getPostDetails(postId: string): Promise<{
    id: string;
    userId: string;
    content: string;
    createdAt?: Date;
  } | null> {
    try {
      const url = `${this.POST_SERVICE_URL}/posts/${postId}`;
      this.logger.log(`Chiamata API: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 5000 })
      );

      const postData = response.data?.data || response.data;

      return {
        id: postData.id || postData._id,
        userId: postData.userId || postData.authorId,
        content: postData.content,
        createdAt: postData.createdAt
          ? new Date(postData.createdAt)
          : undefined,
      };
    } catch (error) {
      this.logger.error(
        `Errore recuperando dettagli post ${postId}:`,
        error.response?.data || error.message
      );
      return null;
    }
  }

  // Recupera i post più recenti da tutti gli utenti
  async getRecentPosts(limit: number = 20, offset: number = 0): Promise<any[]> {
    try {
      const url = `${this.POST_SERVICE_URL}/posts/recent?limit=${limit}&offset=${offset}`;
      this.logger.log(`Chiamata API: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 10000 })
      );

      const posts = response.data?.data || response.data || [];
      this.logger.log(
        `Recuperati ${posts.length} post recenti dal Post Service`
      );

      // Validazione e filtraggio post
      const validPosts = posts.filter((post) => {
        // Controllo esistenza post ID
        if (!post.id && !post._id) {
          this.logger.warn(`Post senza ID trovato`);
          return false;
        }

        // Controllo userId
        const userId = post.userId || post.authorId;
        if (!userId || typeof userId !== 'string' || userId.length !== 36) {
          this.logger.warn(`Post ${post.id} ha userId non valido: ${userId}`);
          return false;
        }

        // Controllo contenuto
        if (!post.content || typeof post.content !== 'string') {
          this.logger.warn(`Post ${post.id} ha contenuto non valido`);
          return false;
        }

        return true;
      });

      this.logger.log(
        `${validPosts.length} post recenti validi su ${posts.length} totali`
      );
      return validPosts;
    } catch (error) {
      this.logger.error(
        `Errore recuperando post recenti:`,
        error.response?.data || error.message
      );
      return [];
    }
  }

  // Recupera post trending
  async getTrendingPosts(
    limit: number = 10,
    timeframe: string = '24h'
  ): Promise<any[]> {
    try {
      // Prova prima l'endpoint trending specifico
      const trendingUrl = `${this.POST_SERVICE_URL}/posts/trending?limit=${limit}&timeframe=${timeframe}`;
      this.logger.log(`Tentativo chiamata trending: ${trendingUrl}`);

      try {
        const response = await firstValueFrom(
          this.httpService.get(trendingUrl, { timeout: 10000 })
        );
        const posts = response.data?.data || response.data || [];
        this.logger.log(`Recuperati ${posts.length} post trending`);

        const validPosts = posts.filter((post) => {
          const userId = post.userId || post.authorId;
          return userId && userId.length === 36 && userId.includes('-');
        });

        return validPosts;
      } catch (trendingError) {
        this.logger.warn(
          'Endpoint trending non disponibile, usando post recenti come fallback'
        );
        return this.getRecentPosts(limit, 0);
      }
    } catch (error) {
      this.logger.error(
        `Errore recuperando post trending:`,
        error.response?.data || error.message
      );
      return [];
    }
  }

  // Genera il feed aggregando i post degli utenti seguiti
  async generateFeedItems(userId: string): Promise<FeedItem[]> {
    try {
      // Validazione input
      if (!userId || typeof userId !== 'string') {
        this.logger.error(`generateFeedItems: userId non valido: ${userId}`);
        return [];
      }

      if (Array.isArray(userId)) {
        this.logger.error(
          'generateFeedItems ricevuto array invece di stringa!',
          userId
        );
        return [];
      }

      this.logger.log(`Generazione feed per utente ${userId}`);

      const followingIds = await this.getFollowing(userId);

      if (followingIds.length === 0) {
        this.logger.log(`Utente ${userId} non segue nessuno`);
        return [];
      }

      this.logger.log(`Utente ${userId} segue ${followingIds.length} persone`);

      // Recupera i post di tutti gli utenti seguiti con gestione errori migliorata
      const allPosts = [];
      const batchSize = 3; // Ridotto per evitare sovraccarico

      for (let i = 0; i < followingIds.length; i += batchSize) {
        const batch = followingIds.slice(i, i + batchSize);

        const batchPromises = batch.map(async (followedUserId) => {
          try {
            // Validazione aggiuntiva
            if (!followedUserId || typeof followedUserId !== 'string') {
              this.logger.warn(
                `Skipping invalid followedUserId: ${followedUserId}`
              );
              return [];
            }

            // Recupera post e dettagli utente in parallelo
            const [posts, userDetails] = await Promise.allSettled([
              this.getUserPosts(followedUserId, 10), // Ridotto numero post per performance
              this.getUserDetails(followedUserId),
            ]);

            // Gestione risultati
            const userPostsResult =
              posts.status === 'fulfilled' ? posts.value : [];
            const userDetailsResult =
              userDetails.status === 'fulfilled' ? userDetails.value : null;

            if (!userDetailsResult) {
              this.logger.warn(
                `Dettagli utente non disponibili per ${followedUserId}`
              );
              return [];
            }

            if (userPostsResult.length === 0) {
              return [];
            }

            return userPostsResult.map((post) => ({
              ...post,
              userId: userDetailsResult.id,
              username: userDetailsResult.username,
            }));
          } catch (error) {
            this.logger.error(
              `Errore processando utente ${followedUserId}:`,
              error.message
            );
            return [];
          }
        });

        try {
          const batchResults = await Promise.all(batchPromises);
          allPosts.push(...batchResults.flat());
        } catch (error) {
          this.logger.error(
            `Errore processando batch ${i}-${i + batchSize}:`,
            error.message
          );
        }
      }

      // Trasforma in FeedItem e ordina per data
      const feedItems: FeedItem[] = allPosts
        .filter((post) => {
          // Validazione finale dei post
          if (!post || !post.id || !post.userId || !post.content) {
            this.logger.warn(
              `Post non valido filtrato durante la creazione del feed`
            );
            return false;
          }

          // Validazione username
          if (!post.username || typeof post.username !== 'string') {
            this.logger.warn(`Post ${post.id} senza username valido`);
            return false;
          }

          return true;
        })
        .map((post) => ({
          postId: post.id || post._id,
          userId: post.userId,
          username: post.username,
          content: post.content,
          createdAt: post.createdAt ? new Date(post.createdAt) : new Date(),
          updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // Più recenti prima
        .slice(0, 100); // Limitiamo a 100 post per performance

      this.logger.log(
        `Feed generato per utente ${userId}: ${feedItems.length} items da ${allPosts.length} post totali`
      );

      return feedItems;
    } catch (error) {
      this.logger.error(
        `Errore generando feed per utente ${userId}:`,
        error.message || error
      );
      throw new HttpException(
        'Errore generando il feed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Recupera i followers di un utente (per invalidare i feed quando posta)
  async getFollowers(userId: string): Promise<string[]> {
    try {
      // Validazione input
      if (!userId || typeof userId !== 'string' || userId.length !== 36) {
        this.logger.error(`getFollowers: userId non valido: ${userId}`);
        return [];
      }

      const url = `${this.SOCIAL_GRAPH_SERVICE_URL}/followers/${userId}`;
      this.logger.log(`Chiamata API: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 5000 })
      );

      const followers =
        response.data?.data?.followers ||
        response.data?.followers ||
        response.data ||
        [];

      // Validazione dei followers ID
      const validFollowers = followers.filter((id: any) => {
        if (!id || typeof id !== 'string' || id.length !== 36) {
          this.logger.warn(
            `Follower ID non valido per utente ${userId}: ${id}`
          );
          return false;
        }
        return true;
      });

      this.logger.log(
        `Utente ${userId} ha ${validFollowers.length} followers validi`
      );
      return validFollowers;
    } catch (error) {
      this.logger.error(
        `Errore recuperando followers per utente ${userId}:`,
        error.response?.data || error.message
      );
      return [];
    }
  }

  // Metodo di utilità per pulire la cache utenti
  clearUserCache(): void {
    this.userDetailsCache.clear();
    this.logger.log('Cache utenti pulita');
  }

  // Metodo per ottenere statistiche della cache
  getCacheStats(): { size: number; ttl: number } {
    return {
      size: this.userDetailsCache.size,
      ttl: this.CACHE_TTL,
    };
  }
}
