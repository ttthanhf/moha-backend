import { registerEnumType } from 'type-graphql';

export enum Role {
	CUSTOMER = 'customer',
	VENDOR = 'vendor',
	ADMIN = 'admin'
}

registerEnumType(Role, {
	name: 'Role'
});
