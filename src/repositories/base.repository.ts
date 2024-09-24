import {
	AnyEntity,
	CountOptions,
	EntityName,
	FilterQuery,
	FindOneOptions,
	FindOptions,
	Loaded,
	PopulatePath,
	Reference
} from '@mikro-orm/core';
import mikroOrmDb from 'database/mikro-orm.db';

export abstract class BaseRepository<Entity extends object> {
	private entity: EntityName<Entity>;

	constructor(entity: EntityName<Entity>) {
		this.entity = entity;
	}

	async create(entity: Entity): Promise<Entity> {
		return mikroOrmDb.em.fork().create(this.entity, entity);
	}

	async save(
		entity:
			| AnyEntity
			| Reference<AnyEntity>
			| Iterable<AnyEntity | Reference<AnyEntity>>
	): Promise<void> {
		return mikroOrmDb.em.fork().persistAndFlush(entity);
	}

	async createAndSave(entity: Entity): Promise<Entity> {
		const newEntity = await this.create(entity);
		await this.save(newEntity);
		return newEntity;
	}

	async findOne<
		Hint extends string = never,
		Fields extends string = '*',
		Excludes extends string = never
	>(
		where: FilterQuery<NoInfer<Entity>>,
		options?: FindOneOptions<Entity, Hint, Fields, Excludes>
	): Promise<Loaded<Entity, Hint, Fields, Excludes> | null> {
		return mikroOrmDb.em.fork().findOne(this.entity, where, options);
	}

	async find<
		Hint extends string = never,
		Fields extends string = PopulatePath.ALL,
		Excludes extends string = never
	>(
		where: FilterQuery<NoInfer<Entity>>,
		options?: FindOptions<Entity, Hint, Fields, Excludes>
	) {
		return mikroOrmDb.em.fork().find(this.entity, where, options);
	}

	async findAndCount(
		where: FilterQuery<NoInfer<Entity>>,
		options?: FindOptions<Entity, never, '*', never> | undefined
	) {
		return mikroOrmDb.em.fork().findAndCount(this.entity, where, options);
	}

	async count<Hint extends string = never>(
		where?: FilterQuery<NoInfer<Entity>>,
		options?: CountOptions<Entity, Hint>
	) {
		return mikroOrmDb.em.fork().count(this.entity, where, options);
	}

	async remove(
		entity:
			| AnyEntity
			| Reference<AnyEntity>
			| Iterable<AnyEntity | Reference<AnyEntity>>
	) {
		return mikroOrmDb.em.fork().removeAndFlush(entity);
	}

	async getRepository() {
		return mikroOrmDb.em.getRepository(this.entity);
	}
}
