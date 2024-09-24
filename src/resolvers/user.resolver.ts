import { GraphQLResolveInfo } from 'graphql';
import { Args, Ctx, Info, Query, Resolver, UseMiddleware } from 'type-graphql';
import { User } from '~entities/user.entity';
import { ResolverUtil } from '~utils/resolver.util';
import { UserArg } from '~types/args/user.arg';
import { Context } from '~types/context.type';
import { AuthMiddleware } from '~middlewares/auth.middleware';
import { UserService } from '~services/user.service';
import { RoleRequire } from 'decorators/auth.decorator';
import { Role } from '~constants/role.constant';

@Resolver(() => User)
export class UserResolver {
	@RoleRequire([Role.ADMIN])
	@Query(() => [User])
	async users(@Info() info: GraphQLResolveInfo) {
		const fields = ResolverUtil.getNodes(
			info.fieldNodes[0].selectionSet?.selections
		);

		return await UserService.getAllUser(fields);
	}

	@RoleRequire([Role.ADMIN])
	@Query(() => User, { nullable: true })
	async user(@Args() userArgs: UserArg, @Info() info: GraphQLResolveInfo) {
		const fields = ResolverUtil.getNodes(
			info.fieldNodes[0].selectionSet?.selections
		);
		const filters = Object.assign({}, userArgs);

		return await UserService.getUserWithFilters(filters, fields);
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Query(() => User)
	async me(@Info() info: GraphQLResolveInfo, @Ctx() ctx: Context) {
		const fields = ResolverUtil.getNodes(
			info.fieldNodes[0].selectionSet?.selections
		);
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId, fields);

		return user;
	}
}
