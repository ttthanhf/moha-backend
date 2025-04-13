import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ID, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export abstract class BaseEntity {
	@Field(() => ID)
	@PrimaryKey({
		autoincrement: true,
		unique: true,
		index: true
	})
	readonly id!: number;

	@Field()
	@Property({ type: 'datetime', nullable: true })
	readonly createdAt: Date = new Date();

	@Property({ onUpdate: () => new Date(), type: 'datetime', nullable: true })
	readonly updatedAt!: Date;

	@Property({ type: 'datetime', nullable: true })
	readonly deletedAt!: Date;
}
