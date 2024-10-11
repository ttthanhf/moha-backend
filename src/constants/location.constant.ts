import { registerEnumType } from 'type-graphql';

export enum LocationType {
	EAT = 'eat',
	DRINK = 'drink',
	PLAY = 'play'
}

registerEnumType(LocationType, {
	name: 'LocationType'
});
