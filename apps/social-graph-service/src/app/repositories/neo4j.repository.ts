import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../services/neo4j.service';
import { UserNode, FollowRelationship } from '../models/relationship.model';

@Injectable()
export class Neo4jRepository {
  constructor(private neo4jService: Neo4jService) {}

  // Crea un nodo utente (viene chiamato quando si registra un nuovo utente)
  async createUserNode(
    userId: string,
    username: string,
    email: string
  ): Promise<UserNode> {
    const query = `
      CREATE (u:User {id: $userId, username: $username, email: $email})
      RETURN u
    `;

    const result = await this.neo4jService.runQuery(query, {
      userId,
      username,
      email,
    });

    const record = result.records[0];
    const userNode = record.get('u').properties;

    return {
      id: userNode.id,
      username: userNode.username,
      email: userNode.email,
    };
  }

  // Crea una relazione FOLLOWS
  async followUser(followerId: string, followingId: string): Promise<boolean> {
    // Prima controlla se la relazione già esiste
    const checkQuery = `
      MATCH (follower:User {id: $followerId})-[r:FOLLOWS]->(following:User {id: $followingId})
      RETURN r
    `;

    const checkResult = await this.neo4jService.runQuery(checkQuery, {
      followerId,
      followingId,
    });

    if (checkResult.records.length > 0) {
      return false; // Relazione già esistente
    }

    // Crea la relazione
    const query = `
      MATCH (follower:User {id: $followerId})
      MATCH (following:User {id: $followingId})
      CREATE (follower)-[r:FOLLOWS {createdAt: datetime()}]->(following)
      RETURN r
    `;

    const result = await this.neo4jService.runQuery(query, {
      followerId,
      followingId,
    });

    return result.records.length > 0;
  }

  // Rimuove una relazione FOLLOWS
  async unfollowUser(
    followerId: string,
    followingId: string
  ): Promise<boolean> {
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
    return deletedCount > 0;
  }

  // Ottieni i followers di un utente
  async getFollowers(userId: string, limit = 50): Promise<UserNode[]> {
    const query = `
      MATCH (follower:User)-[:FOLLOWS]->(user:User {id: $userId})
      RETURN follower
      LIMIT $limit
    `;

    const result = await this.neo4jService.runQuery(query, {
      userId,
      limit: parseInt(limit.toString()),
    });

    return result.records.map((record) => {
      const follower = record.get('follower').properties;
      return {
        id: follower.id,
        username: follower.username,
        email: follower.email,
      };
    });
  }

  // Ottieni gli utenti seguiti da un utente
  async getFollowing(userId: string, limit = 50): Promise<UserNode[]> {
    const query = `
      MATCH (user:User {id: $userId})-[:FOLLOWS]->(following:User)
      RETURN following
      LIMIT $limit
    `;

    const result = await this.neo4jService.runQuery(query, {
      userId,
      limit: parseInt(limit.toString()),
    });

    return result.records.map((record) => {
      const following = record.get('following').properties;
      return {
        id: following.id,
        username: following.username,
        email: following.email,
      };
    });
  }

  // Conta followers
  async getFollowersCount(userId: string): Promise<number> {
    const query = `
      MATCH (follower:User)-[:FOLLOWS]->(user:User {id: $userId})
      RETURN count(follower) as count
    `;

    const result = await this.neo4jService.runQuery(query, { userId });
    return result.records[0]?.get('count').toNumber() || 0;
  }

  // Conta following
  async getFollowingCount(userId: string): Promise<number> {
    const query = `
      MATCH (user:User {id: $userId})-[:FOLLOWS]->(following:User)
      RETURN count(following) as count
    `;

    const result = await this.neo4jService.runQuery(query, { userId });
    return result.records[0]?.get('count').toNumber() || 0;
  }

  // Controlla se un utente segue un altro
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const query = `
      MATCH (follower:User {id: $followerId})-[r:FOLLOWS]->(following:User {id: $followingId})
      RETURN r
    `;

    const result = await this.neo4jService.runQuery(query, {
      followerId,
      followingId,
    });

    return result.records.length > 0;
  }
}
