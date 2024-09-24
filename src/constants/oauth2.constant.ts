import { registerEnumType } from 'type-graphql';

export enum AuthProviderName {
	GOOGLE = 'google'
}

registerEnumType(AuthProviderName, {
	name: 'AuthProviderName'
});
