import {
	createPubSub,
	useExecutionCancellation,
	YogaServerOptions
} from 'graphql-yoga';
import { buildSchema } from 'type-graphql';
import { UserResolver } from '~resolvers/user.resolver';
import { AuthResolver } from '~resolvers/auth.resolver';
import { GlobalMiddleware } from '~middlewares/global.middleware';
import { maxDepthPlugin } from '@escape.tech/graphql-armor-max-depth';
import { maxAliasesPlugin } from '@escape.tech/graphql-armor-max-aliases';
import { maxDirectivesPlugin } from '@escape.tech/graphql-armor-max-directives';
import { costLimitPlugin } from '@escape.tech/graphql-armor-cost-limit';
import { maxTokensPlugin } from '@escape.tech/graphql-armor-max-tokens';
import logger from '~utils/logger.util';
import { GraphQLError, ValidationContext } from 'graphql';
import { FileScalar, FileScalarType } from '~types/scalars/file.scalar';
import { GameResolver } from '~resolvers/game.resolver';
import { OrderResolver } from '~resolvers/order.resolver';
import { DashboardResolver } from '~resolvers/dashboard.resolver';
import { ChatBotResolver } from '~resolvers/chatbot.resolver';

function logReject(ctx: ValidationContext | null, error: GraphQLError) {
	const info = ctx?.getDocument().loc?.source.body.trim().replace(/\s+/g, ' ');
	logger.warn(`${String(error)}: ${info}`);
}

export const pubSub = createPubSub();

/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
export async function getYogaConfig(): Promise<YogaServerOptions<any, any>> {
	return {
		schema: await buildSchema({
			resolvers: [
				UserResolver,
				AuthResolver,
				GameResolver,
				OrderResolver,
				DashboardResolver,
				ChatBotResolver
			],
			globalMiddlewares: [GlobalMiddleware.ErrorInterceptor],
			scalarsMap: [{ type: FileScalarType, scalar: FileScalar }],
			pubSub: pubSub
		}),
		maskedErrors: true,
		plugins: [
			useExecutionCancellation(),
			maxDepthPlugin({
				n: 4,
				propagateOnRejection: true,
				onReject: [logReject]
			}),
			maxAliasesPlugin({
				n: 2,
				onReject: [logReject]
			}),
			maxDirectivesPlugin({
				n: 0,
				onReject: [logReject]
			}),
			costLimitPlugin({
				maxCost: 50,
				onReject: [logReject]
			}),
			maxTokensPlugin({
				n: 500,
				onReject: [logReject]
			})
		],
		graphiql: {
			defaultQuery: `
				query {
					__typename
				}
			`,
			subscriptionsProtocol: 'WS'
		}
		// graphiql: false
	};
}
