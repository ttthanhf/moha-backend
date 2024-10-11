import { Entity, Enum, Property } from '@mikro-orm/core';
import { BaseEntity } from './base.entity';
import { LocationType } from '~constants/location.constant';

@Entity()
export class Location extends BaseEntity {
	@Property()
	name!: string;

	@Property()
	image!: string;

	@Property({
		type: 'float'
	})
	rating!: number;

	@Property()
	numReviews!: number;

	@Property({
		type: 'float'
	})
	distance!: number;

	@Property()
	lowPrice!: number;

	@Property()
	highPrice!: number;

	@Property()
	address!: string;

	@Enum(() => LocationType)
	type!: LocationType;
}
