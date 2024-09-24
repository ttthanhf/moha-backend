import { Field, InputType, Int } from 'type-graphql';

@InputType()
export class ProductInput {
	@Field()
	name!: string;

	@Field()
	description!: string;

	@Field(() => Int)
	price!: number;

	@Field(() => [Int])
	categoryIds!: number[];
}
