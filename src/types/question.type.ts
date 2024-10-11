import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Option {
	@Field()
	value!: string;

	@Field()
	label!: string;
}

@ObjectType()
export class Question {
	@Field()
	id!: number;

	@Field()
	question!: string;

	@Field()
	type!: string;

	@Field(() => [Option])
	options!: Option[];
}
