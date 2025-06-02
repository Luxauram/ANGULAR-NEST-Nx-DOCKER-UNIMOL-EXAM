/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { UserFeed, FeedItem } from '../models/feed.model';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(@InjectRedis() private readonly redis: Redis) {}

  // Chiavi Redis standardizzate
  private getUserFeedKey(userId: string): string {
    return `feed:user:${userId}`;
  }

  private getUserFeedMetaKey(userId: string): string {
    return `feed:meta:${userId}`;
  }

  // Salva il feed dell'utente in Redis
  async saveFeed(userId: string, feed: FeedItem[]): Promise<void> {
    const feedKey = this.getUserFeedKey(userId);
    const metaKey = this.getUserFeedMetaKey(userId);

    try {
      // Usa una transazione Redis per consistenza
      const multi = this.redis.multi();

      // Cancella il vecchio feed
      multi.del(feedKey);

      // Salva i nuovi item del feed come lista ordinata per timestamp
      if (feed.length > 0) {
        const feedData = feed.map((item) => JSON.stringify(item));
        multi.lpush(feedKey, ...feedData);
        multi.expire(feedKey, 3600); // Scade dopo 1 ora
      }

      // Salva metadata
      const metadata = {
        lastUpdated: new Date().toISOString(),
        totalItems: feed.length,
      };
      multi.hset(metaKey, metadata);
      multi.expire(metaKey, 3600);

      await multi.exec();

      this.logger.log(
        `Feed salvato per utente ${userId}: ${feed.length} items`
      );
    } catch (error) {
      this.logger.error(`Errore salvando feed per utente ${userId}:`, error);
      throw error;
    }
  }

  // Recupera il feed dell'utente da Redis
  async getFeed(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<UserFeed | null> {
    const feedKey = this.getUserFeedKey(userId);
    const metaKey = this.getUserFeedMetaKey(userId);

    try {
      // Controlla se il feed esiste
      const exists = await this.redis.exists(feedKey);
      if (!exists) {
        return null;
      }

      // Recupera gli item del feed con paginazione
      const feedData = await this.redis.lrange(
        feedKey,
        offset,
        offset + limit - 1
      );
      const metadata = await this.redis.hgetall(metaKey);

      const items: FeedItem[] = feedData.map((item) => JSON.parse(item));

      return {
        userId,
        items,
        lastUpdated: new Date(metadata.lastUpdated || new Date()),
        totalItems: parseInt(metadata.totalItems || '0'),
      };
    } catch (error) {
      this.logger.error(`Errore recuperando feed per utente ${userId}:`, error);
      return null;
    }
  }

  // Invalida il feed dell'utente
  async invalidateFeed(userId: string): Promise<void> {
    const feedKey = this.getUserFeedKey(userId);
    const metaKey = this.getUserFeedMetaKey(userId);

    try {
      await this.redis.del(feedKey, metaKey);
      this.logger.log(`Feed invalidato per utente ${userId}`);
    } catch (error) {
      this.logger.error(`Errore invalidando feed per utente ${userId}:`, error);
      throw error;
    }
  }

  // Invalida i feed di più utenti (utile quando qualcuno posta)
  async invalidateMultipleFeeds(userIds: string[]): Promise<void> {
    if (userIds.length === 0) return;

    try {
      const keys = userIds.flatMap((userId) => [
        this.getUserFeedKey(userId),
        this.getUserFeedMetaKey(userId),
      ]);

      await this.redis.del(...keys);
      this.logger.log(`Feed invalidati per ${userIds.length} utenti`);
    } catch (error) {
      this.logger.error('Errore invalidando feed multipli:', error);
      throw error;
    }
  }
}
