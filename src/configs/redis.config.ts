import { env } from './env.config';
import { RedisOptions } from 'ioredis';

export const redisConfig: RedisOptions = {
	host: env.DB_REDIS_HOST,
	port: env.DB_REDIS_PORT
};
