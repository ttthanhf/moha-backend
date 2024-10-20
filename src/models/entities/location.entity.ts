import { Entity, Enum, Property } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { LocationType } from '~constants/location.constant';
import { Field, Float, Int, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class Location extends BaseEntity {
	@Field()
	@Property()
	name!: string;

	@Field()
	@Property()
	image!: string;

	@Field(() => Float)
	@Property({
		type: 'float'
	})
	rating!: number;

	@Field(() => Int)
	@Property()
	numReviews!: number;

	@Field(() => Float)
	@Property({
		type: 'float'
	})
	distance!: number;

	@Field(() => Int)
	@Property()
	lowPrice!: number;

	@Field(() => Int)
	@Property()
	highPrice!: number;

	@Field()
	@Property()
	address!: string;

	@Field(() => LocationType)
	@Enum(() => LocationType)
	type!: LocationType;
}
