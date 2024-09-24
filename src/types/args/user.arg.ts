import { ArgsType, Field, Int } from 'type-graphql';

@ArgsType()
export class UserArg {
	@Field(() => Int)
	id!: number;
}
