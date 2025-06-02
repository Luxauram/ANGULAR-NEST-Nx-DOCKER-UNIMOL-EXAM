/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FeedItem } from '../models/feed.model';

@Injectable()
export class ExternalApiService {
  private readonly logger = new Logger(ExternalApiService.name);

  // URLs dei microservizi (configurabili via environment variables)
  private readonly USER_SERVICE_URL =
    process.env.USER_SERVICE_URL || 'http://localhost:3001';
  private readonly POST_SERVICE_URL =
    process.env.POST_SERVICE_URL || 'http://localhost:3002';
  private readonly SOCIAL_GRAPH_SERVICE_URL =
    process.env.SOCIAL_GRAPH_SERVICE_URL || 'http://localhost:3004';

  constructor(private readonly httpService: HttpService) {}

  // Recupera gli utenti seguiti da un utente
  async getFollowing(userId: string): Promise<string[]> {
    try {
      const url = `${this.SOCIAL_GRAPH_SERVICE_URL}/social-graph/following/${userId}`;
      const response = await firstValueFrom(this.httpService.get(url));

      return response.data.following || [];
    } catch (error) {
      this.logger.error(
        `Errore recuperando following per utente ${userId}:`,
        error.message
      );
      // Se il servizio non è disponibile, ritorna array vuoto
      return [];
    }
  }

  // Recupera i dettagli di un utente
  async getUserDetails(
    userId: string
  ): Promise<{ id: string; username: string } | null> {
    try {
      const url = `${this.USER_SERVICE_URL}/users/${userId}`;
      const response = await firstValueFrom(this.httpService.get(url));

      return {
        id: response.data.id,
        username: response.data.username,
      };
    } catch (error) {
      this.logger.error(
        `Errore recuperando dettagli utente ${userId}:`,
        error.message
      );
      return null;
    }
  }

  // Recupera i post di un utente
  async getUserPosts(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const url = `${this.POST_SERVICE_URL}/posts/user/${userId}?limit=${limit}`;
      const response = await firstValueFrom(this.httpService.get(url));

      return response.data || [];
    } catch (error) {
      this.logger.error(
        `Errore recuperando post per utente ${userId}:`,
        error.message
      );
      return [];
    }
  }

  // Genera il feed aggregando i post degli utenti seguiti
  async generateFeedItems(userId: string): Promise<FeedItem[]> {
    try {
      // 1. Recupera gli utenti seguiti
      const followingIds = await this.getFollowing(userId);

      if (followingIds.length === 0) {
        this.logger.log(`Utente ${userId} non segue nessuno`);
        return [];
      }

      this.logger.log(`Utente ${userId} segue ${followingIds.length} persone`);

      // 2. Recupera i post di tutti gli utenti seguiti
      const allPosts = [];

      for (const followedUserId of followingIds) {
        const posts = await this.getUserPosts(followedUserId);

        // Aggiungi i dettagli dell'utente a ogni post
        const userDetails = await this.getUserDetails(followedUserId);

        if (userDetails) {
          const postsWithUser = posts.map((post) => ({
            ...post,
            userId: userDetails.id,
            username: userDetails.username,
          }));

          allPosts.push(...postsWithUser);
        }
      }

      // 3. Trasforma in FeedItem e ordina per data
      const feedItems: FeedItem[] = allPosts
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
      const url = `${this.SOCIAL_GRAPH_SERVICE_URL}/social-graph/followers/${userId}`;
      const response = await firstValueFrom(this.httpService.get(url));

      return response.data.followers || [];
    } catch (error) {
      this.logger.error(
        `Errore recuperando followers per utente ${userId}:`,
        error.message
      );
      return [];
    }
  }
}
