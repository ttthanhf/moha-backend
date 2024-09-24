import { GraphQLError } from 'graphql';
import { createMethodMiddlewareDecorator } from 'type-graphql';
import { Role } from '~constants/role.constant';
import { UserService } from '~services/user.service';
import { Context } from '~types/context.type';
import { JWTUtil } from '~utils/jwt.util';
import logger from '~utils/logger.util';

export function RoleRequire(roles: Role[]) {
	return createMethodMiddlewareDecorator<Context>(async (data, next) => {
		const accessToken = data.context.request.headers.get('authorization');

		if (!accessToken) {
			throw new GraphQLError('Token not found');
		}

		const token = JWTUtil.verify(accessToken);

		if (!token) {
			throw new GraphQLError('Token not valid');
		}

		const user = await UserService.getUserById(token.payload.id);

		if (!user) {
			throw new GraphQLError('User not found with this token');
		}

		if (!roles.includes(user.role)) {
			logger.info(
				`User ${user.id} access denied to "${data.info.path.typename}: ${data.info.path.key}"`
			);
			throw new GraphQLError('Access denied');
		}

		data.context.res.model.data = {
			user: user
		};

		return await next();
	});
}
