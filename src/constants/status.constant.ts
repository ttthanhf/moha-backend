import { registerEnumType } from 'type-graphql';

export enum UserStatus {
	ACTIVE = 'active',
	BAN = 'ban'
}

registerEnumType(UserStatus, {
	name: 'UserStatus'
});
