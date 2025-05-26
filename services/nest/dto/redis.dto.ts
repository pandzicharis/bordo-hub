export interface RedisOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface RedisSetOptions {
  ttl?: number;
}
