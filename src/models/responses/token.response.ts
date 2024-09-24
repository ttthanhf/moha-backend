import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class AccessTokenResponse {
	@Field()
	access_token!: string;
}
