import { Redis } from 'ioredis';
import { redisConfig } from '~configs/redis.config';
import logger from '~utils/logger.util';

class RedisDB {
	redis!: Redis;
	constructor() {
		if (!this.redis) {
			this.redis = new Redis(redisConfig);

			this.redis.on('error', (err) => {
				logger.fatal('Redis: ' + err);
				throw new Error(String(err));
			});

			this.redis.ping().then(() => {
				logger.info('Connected to Redis');
			});
		}
	}
}

export default new RedisDB();
