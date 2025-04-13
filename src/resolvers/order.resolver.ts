import { GraphQLError } from 'graphql';
import {
	Arg,
	Ctx,
	Int,
	Mutation,
	Query,
	Subscription,
	UseMiddleware
} from 'type-graphql';
import { Order } from '~entities/order.entity';
import { AuthMiddleware } from '~middlewares/auth.middleware';
import { OrderService } from '~services/order.service';
import { UserService } from '~services/user.service';
import { Context } from '~types/context.type';
import { CryptoUtil } from '~utils/crypto.util';

export const queueOrder = new Set<string>();

export class OrderResolver {
	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => Order)
	async createOrder(@Ctx() ctx: Context) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Token error or expire');
		}

		const notSucessOrder =
			await OrderService.findNotSuccessOrderByUserIdAnd(userId);
		if (notSucessOrder) {
			return notSucessOrder;
		}

		const newOrder = new Order();
		newOrder.user = user;
		newOrder.amount = 29000;

		const order = await OrderService.createOrder(newOrder);
		order.content = 'moha' + CryptoUtil.encodeNumberTo4Number(order.id);

		await OrderService.updateOrder(order);

		queueOrder.add(order.content);

		return order;
	}

	@Subscription(() => String, {
		topics: ['paymentTopic'],
		filter: ({ payload, args }) => payload.content == args.content
	})
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async paymentTopic(@Arg('content') content: string) {
		return 'OK';
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Query(() => Boolean)
	async checkOrder(
		@Ctx() ctx: Context,
		@Arg('orderId', () => Int) orderId: number
	) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Token error or expire');
		}

		const order = await OrderService.findOrderByIdAndUserId(orderId, userId);
		if (!order) {
			throw new GraphQLError('Order not found');
		}
		if (order.isSuccess) {
			return true;
		} else {
			const response = await fetch(
				`https://payment.thanhf.dev/check?amount=${order.amount}&content=${order.content}`
			);
			const result = await response.json();

			if (result.result) {
				if (user.isPremium) {
					const currentPremiumExpireAt = user.premiumExpireAt;
					user.premiumExpireAt = new Date(
						currentPremiumExpireAt.setMonth(
							currentPremiumExpireAt.getMonth() + 1
						)
					);
				} else {
					const currentDate = new Date();
					const nextMonth = new Date(
						currentDate.setMonth(currentDate.getMonth() + 1)
					);

					user.isPremium = true;
					user.premiumExpireAt = nextMonth;
				}

				await UserService.updateUser(user);

				order.isSuccess = true;
				order.paymentAt = new Date();
				await OrderService.updateOrder(order);

				return true;
			}
			return false;
		}
	}

	@Query(() => [Order])
	async listOrder() {
		const orders = await OrderService.findSuccessOrder();
		return orders;
	}
}
