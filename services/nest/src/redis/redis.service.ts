import { RedisOptions, RedisSetOptions } from './../../dto/redis.dto';
import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    const options: RedisOptions = {
      host: 'redis',
      port: Number(process.env.REDIS_PORT) || 6379,
    };
    this.client = new Redis(options);

    this.client.on('ready', () => {
      this.logger.log(`✅ Redis connection established to ${options.host}:${options.port}`);
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis error', err);
    });
  }

  async get(table: string, key: string): Promise<string | null> {
    return this.client.get(`${table}:${key}`);
  }

  async set(table: string, key: string, value: string, options?: RedisSetOptions): Promise<void> {
    const fullKey = `${table}:${key}`;
    if (options?.ttl) {
      await this.client.set(fullKey, value, 'EX', options.ttl);
    } else {
      await this.client.set(fullKey, value);
    }
  }

  async del(table: string, key: string): Promise<void> {
    await this.client.del(`${table}:${key}`);
  }

  onModuleDestroy() {
    this.client.quit();
  }
}
