import { EntityManager, MikroORM } from '@mikro-orm/core';
import mikroOrmConfig from '~configs/mikro-orm.config';
import logger from '~utils/logger.util';

class MikroOrmDB {
	private orm!: MikroORM;
	em!: EntityManager;
	constructor() {
		if (!this.orm) {
			this.init();
		}
	}
	async init() {
		try {
			this.orm = await MikroORM.init(mikroOrmConfig);
			this.em = this.orm.em;
			await this.orm.getSchemaGenerator().updateSchema();
			logger.info('Connected to MariaDB');
		} catch (err) {
			logger.fatal(err.stack);
			throw new Error(err.stack);
		}
	}
}

export default new MikroOrmDB();
