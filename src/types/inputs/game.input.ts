import { Field, InputType, Int } from 'type-graphql';

@InputType()
export class GameResultInput {
	@Field()
	distance!: string;

	@Field(() => Int)
	lowPrice!: number;

	@Field(() => Int)
	highPrice!: number;
}
