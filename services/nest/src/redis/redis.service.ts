import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;

  async onModuleInit() {
    this.client = new Redis({
      host: 'redis',
      port: 6379,
    });

    this.client.on('connect', () => {
      this.logger.log('✅ Connected to Redis');
    });

    this.client.on('error', (err) => {
      this.logger.error(`❌ Redis error: ${err.message}`);
    });
  }

  async set(key: string, value: any): Promise<void> {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

    await this.client.set(key, stringValue);
  }

  async get<T = any>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return value as unknown as T;
    }
  }

  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  getClient(): Redis {
    return this.client;
  }
}
