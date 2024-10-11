import { defineConfig, MariaDbDriver } from '@mikro-orm/mariadb';

import { User } from '~entities/user.entity';
import logger from '~utils/logger.util';
import { env } from './env.config';
import { Location } from '~entities/location.entity';

const userEntities = [User];
const entities = [...userEntities, Location];

export default defineConfig({
	driver: MariaDbDriver,
	entities: entities,
	entitiesTs: entities,
	dbName: env.DB_MARIABD_DATABASE,
	user: env.DB_MARIABD_USER,
	password: env.DB_MARIABD_PASSWORD,
	host: env.DB_MARIABD_HOST,
	port: env.DB_MARIABD_PORT,
	debug: env.SERVER_LOG_DB_DEBUG,
	logger: (msg) => {
		logger.debug(msg);
	},
	pool: {
		min: 2,
		max: 10
	},
	collate: 'utf8mb4_general_ci'
});
