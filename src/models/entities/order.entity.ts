import { Entity, ManyToOne, Property, Rel } from '@mikro-orm/core';
import { Field, Int, ObjectType } from 'type-graphql';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';

@ObjectType()
@Entity()
export class Order extends BaseEntity {
	@Field(() => User)
	@ManyToOne(() => User, { index: true })
	user!: Rel<User>;

	@Field({ nullable: true })
	@Property({ nullable: true })
	referenceCode!: string;

	@Field({ nullable: true })
	@Property({ type: 'datetime', nullable: true })
	paymentAt!: Date;

	@Field({ nullable: true })
	@Property({ nullable: true })
	content!: string;

	@Field(() => Int)
	@Property({ type: 'int' })
	amount!: number;

	@Field()
	@Property()
	isSuccess: boolean = false;
}
