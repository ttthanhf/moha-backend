import { GraphQLError } from 'graphql';
import { MiddlewareFn } from 'type-graphql';
import logger from '~utils/logger.util';

export class GlobalMiddleware {
	static ErrorInterceptor: MiddlewareFn = async (_, next) => {
		try {
			await next();
		} catch (error) {
			const errorStack = error.stack;
			const errorType = errorStack.split(':')[0];
			if (errorType == 'GraphQLError') {
				logger.info(error.message);
				throw new GraphQLError(error);
			}

			logger.error(error.stack);
			throw new Error(error);
		}
	};
}
