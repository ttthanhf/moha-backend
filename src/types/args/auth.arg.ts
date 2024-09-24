import { ArgsType, Field } from 'type-graphql';

@ArgsType()
export class RegisterArgs {
	@Field(() => String)
	email!: string;

	@Field(() => String)
	password!: string;

	@Field(() => String)
	fullName!: string;

	@Field(() => String)
	phone!: string;
}
