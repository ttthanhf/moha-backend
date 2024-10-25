import { registerEnumType } from 'type-graphql';

export enum LocationType {
	EAT = 'eat',
	DRINK = 'drink',
	PLAY = 'play',
	UNKNOWN = 'unknown'
}

registerEnumType(LocationType, {
	name: 'LocationType'
});
