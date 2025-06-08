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

  constructor(private readonly httpService: HttpService) {}

  // Recupera gli utenti seguiti da un utente
  async getFollowing(userId: string): Promise<string[]> {
    try {
      const url = `${this.SOCIAL_GRAPH_SERVICE_URL}/api/social/following/${userId}`;
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

      // 🔍 DEBUG LOG per controllare il tipo di ogni elemento
      console.log('🔍 Following raw response:', following);
      following.forEach((id, index) => {
        console.log(`🔍 following[${index}]:`, typeof id, id);
        if (Array.isArray(id)) {
          console.error(`❌ ERRORE: following[${index}] è un array!`, id);
        }
      });

      this.logger.log(`Utente ${userId} segue ${following.length} persone`);
      return following;
    } catch (error) {
      this.logger.error(
        `Errore recuperando following per utente ${userId}:`,
        error.response?.data || error.message
      );
      // Se il servizio non è disponibile, ritorna array vuoto
      return [];
    }
  }

  // Recupera i dettagli di un utente
  async getUserDetails(
    userId: string
  ): Promise<{ id: string; username: string; email?: string } | null> {
    try {
      // 🔍 DEBUG LOG
      console.log('🔍 getUserDetails chiamato con:', typeof userId, userId);
      if (Array.isArray(userId)) {
        console.error(
          '❌ ERRORE: getUserDetails ricevuto array invece di stringa!',
          userId
        );
        return null;
      }

      const url = `${this.USER_SERVICE_URL}/users/${userId}`;
      this.logger.log(`Chiamata API: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 5000 })
      );

      const userData = response.data?.data || response.data;

      return {
        id: userData.id,
        username: userData.username,
        email: userData.email,
      };
    } catch (error) {
      this.logger.error(
        `Errore recuperando dettagli utente ${userId}:`,
        error.response?.data || error.message
      );
      return null;
    }
  }

  // Recupera i post di un utente
  async getUserPosts(userId: string, limit: number = 50): Promise<any[]> {
    try {
      // 🔍 DEBUG LOG
      console.log('🔍 getUserPosts chiamato con:', typeof userId, userId);
      if (Array.isArray(userId)) {
        console.error(
          '❌ ERRORE: getUserPosts ricevuto array invece di stringa!',
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

      const validPosts = posts.filter((post) => {
        const userId = post.userId || post.authorId;
        return userId && userId.length === 36 && userId.includes('-');
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
      this.logger.log(`Recuperati ${posts.length} post recenti`);

      const validPosts = posts.filter((post) => {
        const userId = post.userId || post.authorId;
        return userId && userId.length === 36 && userId.includes('-');
      });

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
      // 🔍 DEBUG LOG
      console.log('🔍 generateFeedItems chiamato con:', typeof userId, userId);
      if (Array.isArray(userId)) {
        console.error(
          '❌ ERRORE: generateFeedItems ricevuto array invece di stringa!',
          userId
        );
        throw new Error('userId non può essere un array');
      }

      const followingIds = await this.getFollowing(userId);

      // 🔍 DEBUG LOG per ogni ID nell'array following
      console.log('🔍 followingIds recuperati:', followingIds);
      followingIds.forEach((id, index) => {
        console.log(`🔍 followingIds[${index}]:`, typeof id, id);
        if (Array.isArray(id)) {
          console.error(`❌ ERRORE: followingIds[${index}] è un array!`, id);
        }
      });

      if (followingIds.length === 0) {
        this.logger.log(`Utente ${userId} non segue nessuno`);
        return [];
      }

      this.logger.log(`Utente ${userId} segue ${followingIds.length} persone`);

      // 2. Recupera i post di tutti gli utenti seguiti
      const allPosts = [];

      // Processa gli utenti in batch per performance
      const batchSize = 5;
      for (let i = 0; i < followingIds.length; i += batchSize) {
        const batch = followingIds.slice(i, i + batchSize);

        const batchPromises = batch.map(async (followedUserId) => {
          // 🔍 DEBUG LOG
          console.log(
            '🔍 Processando followedUserId:',
            typeof followedUserId,
            followedUserId
          );
          if (Array.isArray(followedUserId)) {
            console.error(
              '❌ ERRORE: followedUserId è un array nel batch!',
              followedUserId
            );
            return [];
          }

          // Recupera i post dell'utente seguito
          const [posts, userDetails] = await Promise.all([
            this.getUserPosts(followedUserId, 20),
            this.getUserDetails(followedUserId),
          ]);

          if (userDetails && posts.length > 0) {
            return posts.map((post) => ({
              ...post,
              userId: userDetails.id,
              username: userDetails.username,
            }));
          }
          return [];
        });

        const batchResults = await Promise.all(batchPromises);
        allPosts.push(...batchResults.flat());
      }

      // 3. Trasforma in FeedItem e ordina per data
      const feedItems: FeedItem[] = allPosts
        .filter((post) => post && post.id) // Filtra post validi
        .map((post) => ({
          postId: post.id || post._id,
          userId: post.userId,
          username: post.username,
          content: post.content,
          createdAt: new Date(post.createdAt),
          updatedAt: post.updatedAt ? new Date(post.updatedAt) : undefined,
        }))
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()) // Più recenti prima
        .slice(0, 100); // Limitiamo a 100 post per performance

      this.logger.log(
        `Feed generato per utente ${userId}: ${feedItems.length} items`
      );
      return feedItems;
    } catch (error) {
      this.logger.error(`Errore generando feed per utente ${userId}:`, error);
      throw new HttpException(
        'Errore generando il feed',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Recupera i followers di un utente (per invalidare i feed quando posta)
  async getFollowers(userId: string): Promise<string[]> {
    try {
      const url = `${this.SOCIAL_GRAPH_SERVICE_URL}/api/social/followers/${userId}`;
      this.logger.log(`Chiamata API: ${url}`);

      const response = await firstValueFrom(
        this.httpService.get(url, { timeout: 5000 })
      );

      const followers =
        response.data?.data?.followers ||
        response.data?.followers ||
        response.data ||
        [];

      this.logger.log(`Utente ${userId} ha ${followers.length} followers`);
      return followers;
    } catch (error) {
      this.logger.error(
        `Errore recuperando followers per utente ${userId}:`,
        error.response?.data || error.message
      );
      return [];
    }
  }
}
