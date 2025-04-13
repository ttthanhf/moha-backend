import { Field, Int, ObjectType } from 'type-graphql';

@ObjectType()
export class OverViewResponse {
	@Field(() => Int)
	totalTransaction!: number;

	@Field(() => Int)
	totalRevenue!: number;

	@Field(() => Int)
	totalCustomer!: number;

	@Field(() => Int)
	totalPremiumCustomer!: number;
}

@ObjectType()
export class RevenueDetail {
	@Field()
	date!: Date;

	@Field()
	percent!: number;

	@Field(() => Int)
	totalRevenue!: number;
}

@ObjectType()
export class RevenueResponse {
	@Field(() => [RevenueDetail])
	current!: RevenueDetail[];

	@Field(() => [RevenueDetail])
	before!: RevenueDetail[];
}
