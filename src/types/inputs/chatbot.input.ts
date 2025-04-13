import { Field, InputType, registerEnumType } from 'type-graphql';

enum RoleChatBot {
	user = 'user',
	model = 'model'
}

registerEnumType(RoleChatBot, {
	name: 'RoleChatBot'
});

@InputType()
export class HyperChatBotInput {
	@Field(() => RoleChatBot)
	role!: RoleChatBot;

	@Field()
	message!: string;
}

@InputType()
export class BotInput {
	@Field(() => RoleChatBot)
	role!: RoleChatBot;

	@Field()
	message!: string;
}
