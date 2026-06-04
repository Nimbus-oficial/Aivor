import { Injectable, OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { DatabaseConfigurationError } from "./database.errors";
import type { QueryValue } from "./types/database.types";

@Injectable()
export class DatabaseService implements OnApplicationShutdown {
  private pool?: Pool;
  private readonly connectionString?: string;
  private readonly poolSize: number;

  constructor(configService: ConfigService) {
    this.connectionString = configService.get<string>("DATABASE_URL");
    this.poolSize = Number(configService.get<string>("DATABASE_POOL_SIZE") ?? 10);
  }

  async query<T extends QueryResultRow>(
    sql: string,
    values: QueryValue[] = []
  ) {
    return this.getPool().query<T>(sql, values);
  }

  async withTransaction<T>(callback: (client: PoolClient) => Promise<T>) {
    const client = await this.getPool().connect();
    try {
      await client.query("BEGIN");
      const result = await callback(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async onApplicationShutdown() {
    await this.pool?.end();
  }

  isConfigured() {
    return Boolean(this.connectionString);
  }

  async ping() {
    if (!this.connectionString) {
      return {
        status: "not_configured" as const,
        latencyMs: null
      };
    }

    const startedAt = Date.now();
    await this.query("SELECT 1");
    return {
      status: "ok" as const,
      latencyMs: Date.now() - startedAt
    };
  }

  private getPool() {
    if (!this.connectionString) {
      throw new DatabaseConfigurationError("DATABASE_URL is required");
    }

    this.pool ??= new Pool({
      connectionString: this.connectionString,
      max: this.poolSize,
      idleTimeoutMillis: 30_000
    });

    return this.pool;
  }
}
