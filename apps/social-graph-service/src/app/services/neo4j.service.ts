import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import neo4j, { Driver, Session } from 'neo4j-driver';

@Injectable()
export class Neo4jService implements OnModuleInit, OnModuleDestroy {
  private driver: Driver;

  async onModuleInit() {
    const uri = process.env.NEO4J_URI;
    const username = process.env.NEO4J_USERNAME;
    const password = process.env.NEO4J_PASSWORD;

    this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password));

    try {
      const serverInfo = await this.driver.getServerInfo();
      console.log('✅ Neo4j connection established');
      console.log(
        `Connected to Neo4j ${serverInfo.protocolVersion} at ${serverInfo.address}`
      );
    } catch (error) {
      console.error('❌ Neo4j connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.driver) {
      await this.driver.close();
    }
  }

  getSession(): Session {
    return this.driver.session();
  }

  async runQuery(query: string, parameters = {}) {
    const session = this.getSession();
    try {
      const result = await session.run(query, parameters);
      return result;
    } finally {
      await session.close();
    }
  }
}
