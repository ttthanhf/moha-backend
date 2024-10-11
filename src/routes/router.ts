import { execute, ExecutionArgs, subscribe } from 'graphql';
import { makeBehavior } from 'graphql-ws/lib/use/uWebSockets';
import { createYoga } from 'graphql-yoga';
import { TemplatedApp } from 'uWebSockets.js';
import { getYogaConfig } from '~configs/yoga.config';
import { joinedUserIds, rooms } from '~resolvers/game.resolver';
import logger from '~utils/logger.util';

type EnvelopedExecutionArgs = ExecutionArgs & {
	rootValue: {
		execute: typeof execute;
		subscribe: typeof subscribe;
	};
};

const wsStored = new Map<string, number>();

export async function routerInit(app: TemplatedApp) {
	const yogaServer = createYoga(await getYogaConfig());
	app.any('/graphql', yogaServer);
	app.ws(
		yogaServer.graphqlEndpoint,
		makeBehavior<Record<string, unknown> | undefined>({
			connectionInitWaitTimeout: 10000,
			onConnect: (ctx) => {
				const uniqueIdWs =
					ctx.extra.persistedRequest.headers['sec-websocket-key'];

				// wsStored.set(uniqueIdWs);
				return true;
			},
			// onOperation(ctx, message, args, result) {
			// 	console.log('Operation: ' + message);
			// },
			// onNext(ctx, message, args, result) {
			// 	console.log('Next: ' + message);
			// },
			onError: (ctx, message, errors) => {
				console.log('Error: ' + message);
				logger.error(errors);
			},
			onClose: (ctx, code, reason) => {
				// joinedUserIds.get;
				logger.debug('Close: ' + reason + ', Code: ' + code);
			},
			onDisconnect: (ctx, code, reason) => {
				logger.debug('Disconnect: ' + reason + ', Code: ' + code);
			},
			onComplete: (ctx, message) => {
				logger.debug('Complete: ' + message);
			},
			execute: (args) =>
				(args as EnvelopedExecutionArgs).rootValue.execute(args),
			subscribe: (args) =>
				(args as EnvelopedExecutionArgs).rootValue.subscribe(args),
			onSubscribe: async (ctx, msg) => {
				const { schema, execute, subscribe, contextFactory, parse, validate } =
					yogaServer.getEnveloped(ctx);

				const args: EnvelopedExecutionArgs = {
					schema,
					operationName: msg.payload.operationName,
					document: parse(msg.payload.query),
					variableValues: msg.payload.variables,
					contextValue: await contextFactory(),
					rootValue: {
						execute,
						subscribe
					}
				};

				const errors = validate(args.schema, args.document);
				if (errors.length) return errors;
				return args;
			}
		})
	);

	app.any('/*', (res) => {
		res.end('404');
	});
}
