import neo4j from 'neo4j-driver';
import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../services/neo4j.service';
import { UserNode } from '../models/relationship.model';

@Injectable()
export class Neo4jRepository {
  constructor(private neo4jService: Neo4jService) {}

  // Crea un nodo utente (sincronizza da user-service)
  async createUserNode(
    userId: string,
    username: string,
    email: string
  ): Promise<UserNode> {
    console.log('🔧 [Neo4jRepository] Creating user node:', {
      userId,
      username,
      email,
    });

    const query = `
      CREATE (u:User {id: $userId, username: $username, email: $email, createdAt: datetime()})
      RETURN u
    `;

    const result = await this.neo4jService.runQuery(query, {
      userId,
      username,
      email,
    });

    console.log(
      '🔧 [Neo4jRepository] User node creation result:',
      result.records.length
    );

    const record = result.records[0];
    const userNode = record.get('u').properties;

    const createdUser = {
      id: userNode.id,
      username: userNode.username,
      email: userNode.email,
    };

    console.log(
      '✅ [Neo4jRepository] User node created successfully:',
      createdUser
    );
    return createdUser;
  }

  // Aggiorna un nodo utente esistente
  async updateUserNode(
    userId: string,
    username: string,
    email: string
  ): Promise<UserNode> {
    console.log('🔧 [Neo4jRepository] Updating user node:', {
      userId,
      username,
      email,
    });

    const query = `
      MATCH (u:User {id: $userId})
      SET u.username = $username, u.email = $email, u.updatedAt = datetime()
      RETURN u
    `;

    const result = await this.neo4jService.runQuery(query, {
      userId,
      username,
      email,
    });

    if (result.records.length === 0) {
      throw new Error(`User with id ${userId} not found for update`);
    }

    const record = result.records[0];
    const userNode = record.get('u').properties;

    const updatedUser = {
      id: userNode.id,
      username: userNode.username,
      email: userNode.email,
    };

    console.log(
      '✅ [Neo4jRepository] User node updated successfully:',
      updatedUser
    );
    return updatedUser;
  }

  // Verifica se un utente esiste come nodo
  async userExists(userId: string): Promise<boolean> {
    console.log('🔍 [Neo4jRepository] Checking if user exists:', userId);

    const query = `
      MATCH (u:User {id: $userId})
      RETURN u
    `;

    const result = await this.neo4jService.runQuery(query, { userId });
    const exists = result.records.length > 0;

    console.log('🔍 [Neo4jRepository] User exists result:', { userId, exists });
    return exists;
  }

  // Crea una relazione FOLLOWS
  async followUser(followerId: string, followingId: string): Promise<boolean> {
    console.log('👥 [Neo4jRepository] Starting followUser:', {
      followerId,
      followingId,
    });

    // Controlla se la relazione già esiste
    const checkQuery = `
      MATCH (follower:User {id: $followerId})-[r:FOLLOWS]->(following:User {id: $followingId})
      RETURN r
    `;

    console.log('🔍 [Neo4jRepository] Checking existing relationship...');
    const checkResult = await this.neo4jService.runQuery(checkQuery, {
      followerId,
      followingId,
    });

    console.log('🔍 [Neo4jRepository] Existing relationship check result:', {
      relationshipExists: checkResult.records.length > 0,
      recordsFound: checkResult.records.length,
    });

    if (checkResult.records.length > 0) {
      console.log('⚠️ [Neo4jRepository] Relationship already exists');
      return false; // Relazione già esistente
    }

    // Crea la relazione
    const createQuery = `
      MATCH (follower:User {id: $followerId})
      MATCH (following:User {id: $followingId})
      CREATE (follower)-[r:FOLLOWS {createdAt: datetime()}]->(following)
      RETURN r
    `;

    console.log('➕ [Neo4jRepository] Creating new relationship...');
    const result = await this.neo4jService.runQuery(createQuery, {
      followerId,
      followingId,
    });

    const success = result.records.length > 0;
    console.log('✅ [Neo4jRepository] Relationship creation result:', {
      success,
      recordsCreated: result.records.length,
    });

    return success;
  }

  // Rimuove una relazione FOLLOWS
  async unfollowUser(
    followerId: string,
    followingId: string
  ): Promise<boolean> {
    console.log('👥 [Neo4jRepository] Starting unfollowUser:', {
      followerId,
      followingId,
    });

    const query = `
      MATCH (follower:User {id: $followerId})-[r:FOLLOWS]->(following:User {id: $followingId})
      DELETE r
      RETURN count(r) as deletedCount
    `;

    const result = await this.neo4jService.runQuery(query, {
      followerId,
      followingId,
    });

    const deletedCount = result.records[0]?.get('deletedCount').toNumber() || 0;
    console.log('🗑️ [Neo4jRepository] Unfollow result:', { deletedCount });

    return deletedCount > 0;
  }

  // Ottieni i followers di un utente
  async getFollowers(userId: string, limit = 50): Promise<UserNode[]> {
    console.log('👥 [Neo4jRepository] Getting followers for user:', {
      userId,
      limit,
      limitType: typeof limit,
    });

    const neo4jLimit = neo4j.int(limit);

    console.log('🔧 [DEBUG] Neo4j limit:', neo4jLimit, typeof neo4jLimit);

    const query = `
    MATCH (follower:User)-[:FOLLOWS]->(user:User {id: $userId})
    RETURN follower
    LIMIT $limit
  `;

    try {
      const result = await this.neo4jService.runQuery(query, {
        userId,
        limit: neo4jLimit,
      });

      const followers = result.records.map((record) => {
        const follower = record.get('follower').properties;
        return {
          id: follower.id,
          username: follower.username,
          email: follower.email,
        };
      });

      console.log('👥 [Neo4jRepository] Followers found:', followers.length);
      return followers;
    } catch (error) {
      console.error('❌ [Neo4jRepository] Get followers failed:', error);
      throw error;
    }
  }

  // Ottieni i following di un utente
  async getFollowing(userId: string, limit = 50): Promise<UserNode[]> {
    console.log('👥 [Neo4jRepository] Getting following for user:', {
      userId,
      limit,
      limitType: typeof limit,
    });

    const neo4jLimit = neo4j.int(limit);

    const query = `
    MATCH (user:User {id: $userId})-[:FOLLOWS]->(following:User)
    RETURN following
    LIMIT $limit
  `;

    try {
      const result = await this.neo4jService.runQuery(query, {
        userId,
        limit: neo4jLimit,
      });

      const following = result.records.map((record) => {
        const followingUser = record.get('following').properties;
        return {
          id: followingUser.id,
          username: followingUser.username,
          email: followingUser.email,
        };
      });

      console.log('👥 [Neo4jRepository] Following found:', following.length);
      return following;
    } catch (error) {
      console.error('❌ [Neo4jRepository] Get following failed:', error);
      throw error;
    }
  }

  // Conta followers
  async getFollowersCount(userId: string): Promise<number> {
    console.log(
      '📊 [Neo4jRepository] Getting followers count for user:',
      userId
    );

    const query = `
      MATCH (follower:User)-[:FOLLOWS]->(user:User {id: $userId})
      RETURN count(follower) as count
    `;

    const result = await this.neo4jService.runQuery(query, { userId });
    const count = result.records[0]?.get('count').toNumber() || 0;

    console.log('📊 [Neo4jRepository] Followers count result:', {
      userId,
      count,
    });
    return count;
  }

  // Conta following
  async getFollowingCount(userId: string): Promise<number> {
    console.log(
      '📊 [Neo4jRepository] Getting following count for user:',
      userId
    );

    const query = `
      MATCH (user:User {id: $userId})-[:FOLLOWS]->(following:User)
      RETURN count(following) as count
    `;

    const result = await this.neo4jService.runQuery(query, { userId });
    const count = result.records[0]?.get('count').toNumber() || 0;

    console.log('📊 [Neo4jRepository] Following count result:', {
      userId,
      count,
    });
    return count;
  }

  // Controlla se un utente segue un altro
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    console.log('🔍 [Neo4jRepository] Checking if user is following:', {
      followerId,
      followingId,
    });

    const query = `
      MATCH (follower:User {id: $followerId})-[r:FOLLOWS]->(following:User {id: $followingId})
      RETURN r
    `;

    const result = await this.neo4jService.runQuery(query, {
      followerId,
      followingId,
    });

    const isFollowing = result.records.length > 0;
    console.log('🔍 [Neo4jRepository] Is following result:', {
      followerId,
      followingId,
      isFollowing,
    });

    return isFollowing;
  }

  // Metodo di utilità per vedere tutti gli utenti nel database
  async getAllUsers(): Promise<UserNode[]> {
    console.log('🔍 [Neo4jRepository] Getting all users in database');

    const query = `
      MATCH (u:User)
      RETURN u
      ORDER BY u.username
    `;

    const result = await this.neo4jService.runQuery(query);
    const users = result.records.map((record) => {
      const user = record.get('u').properties;
      return {
        id: user.id,
        username: user.username,
        email: user.email,
      };
    });

    console.log('🔍 [Neo4jRepository] All users found:', users.length, users);
    return users;
  }

  // Metodo di utilità per vedere tutte le relazioni
  async getAllRelationships(): Promise<any[]> {
    console.log('🔍 [Neo4jRepository] Getting all relationships in database');

    const query = `
      MATCH (follower:User)-[r:FOLLOWS]->(following:User)
      RETURN follower.id as followerId, follower.username as followerUsername,
            following.id as followingId, following.username as followingUsername,
            r.createdAt as createdAt
      ORDER BY r.createdAt DESC
    `;

    const result = await this.neo4jService.runQuery(query);
    const relationships = result.records.map((record) => ({
      followerId: record.get('followerId'),
      followerUsername: record.get('followerUsername'),
      followingId: record.get('followingId'),
      followingUsername: record.get('followingUsername'),
      createdAt: record.get('createdAt'),
    }));

    console.log(
      '🔍 [Neo4jRepository] All relationships found:',
      relationships.length,
      relationships
    );
    return relationships;
  }
}
