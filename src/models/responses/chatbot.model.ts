import { Field, ObjectType } from 'type-graphql';
import { Location } from '~entities/location.entity';

@ObjectType()
export class ChatbotResponse {
	@Field({ nullable: true })
	message!: string;

	@Field(() => [Location], { nullable: true })
	locations!: Location[];

	@Field()
	isShowLocation!: boolean;

	@Field()
	isError!: boolean;
}
