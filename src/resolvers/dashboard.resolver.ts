import {
	OverViewResponse,
	RevenueDetail,
	RevenueResponse
} from 'models/responses/dashboard.model';
import { PageInfo } from 'models/responses/pagination/base.response';
import { UsersWithPaginationResponse } from 'models/responses/pagination/user.response';
import { Args, Query } from 'type-graphql';
import { OrderService } from '~services/order.service';
import { UserService } from '~services/user.service';
import { PageInfoArgs } from '~types/args/pagination.arg';
import { DateTimeUtil } from '~utils/datetime.util';

export class DashboardResolver {
	@Query(() => OverViewResponse)
	async getOverView() {
		const overViewResponse = new OverViewResponse();

		overViewResponse.totalCustomer = await UserService.countAllUsers();
		overViewResponse.totalNewCustomer =
			await UserService.countAllTodayNewUsers();

		const totalOrder = await OrderService.countSuccessOrders();
		overViewResponse.totalTransaction = totalOrder;
		overViewResponse.totalRevenue = totalOrder * 29000;

		return overViewResponse;
	}

	@Query(() => UsersWithPaginationResponse)
	async getCustomerList(@Args() pageInfoArgs: PageInfoArgs) {
		const [customerList, totalItem] =
			await UserService.getUsersWithPagination(pageInfoArgs);

		const pageInfo = new PageInfo(totalItem, pageInfoArgs);

		return {
			items: customerList,
			pageInfo: pageInfo
		};
	}

	@Query(() => RevenueResponse)
	async getRevenue() {
		const current = new Date();
		const last7Days = new Date();
		last7Days.setDate(current.getDate() - 7);
		const last14Days = new Date();
		last14Days.setDate(last7Days.getDate() - 7);

		const last7DaysOrders =
			await OrderService.getSuccessOrdersFromStartDateToEndDate(
				last7Days,
				current
			);

		const last14DaysOrders =
			await OrderService.getSuccessOrdersFromStartDateToEndDate(
				last14Days,
				last7Days
			);

		const currentRevenueDetails: RevenueDetail[] = [];
		const beforeRevenueDetails: RevenueDetail[] = [];

		last7DaysOrders.forEach((order) => {
			const dateStringOrder = DateTimeUtil.formatDate(order.createdAt);

			const currentRevenueDetail = currentRevenueDetails.find(
				(currentRevenueDetail) => {
					const dateStringCurrentRevenueDetail = DateTimeUtil.formatDate(
						currentRevenueDetail.date
					);

					return dateStringOrder == dateStringCurrentRevenueDetail;
				}
			);

			if (currentRevenueDetail) {
				currentRevenueDetail.totalRevenue += order.amount;
			} else {
				currentRevenueDetails.push({
					date: new Date(dateStringOrder),
					totalRevenue: order.amount,
					percent: 0
				});
			}
		});

		last14DaysOrders.forEach((order) => {
			const dateStringOrder = DateTimeUtil.formatDate(order.createdAt);

			const currentRevenueDetail = beforeRevenueDetails.find(
				(currentRevenueDetail) => {
					const dateStringCurrentRevenueDetail = DateTimeUtil.formatDate(
						currentRevenueDetail.date
					);

					return dateStringOrder == dateStringCurrentRevenueDetail;
				}
			);

			if (currentRevenueDetail) {
				currentRevenueDetail.totalRevenue += order.amount;
			} else {
				beforeRevenueDetails.push({
					date: new Date(dateStringOrder),
					totalRevenue: order.amount,
					percent: 0
				});
			}
		});

		// for (let index = 0; index < last7DaysOrders.length; index++) {
		// const currentRevenueDetail = currentRevenueDetails[index];
		// const currentRevenueDetailDate = new Date(currentRevenueDetail.date);
		// const indexBeforeRevenueDetail = beforeRevenueDetails.findIndex(
		// 	(beforeRevenueDetail) =>
		// 		beforeRevenueDetail.date.getTime() ===
		// 		new Date(
		// 			new Date(currentRevenueDetailDate).setDate(
		// 				currentRevenueDetailDate.getDate() - 7
		// 			)
		// 		).getTime()
		// );
		// if (currentRevenueDetail && indexBeforeRevenueDetail >= 0) {
		// 	const beforeRevenueDetail =
		// 		beforeRevenueDetails[indexBeforeRevenueDetail];
		// 	const totalRevenueDetail =
		// 		currentRevenueDetail.totalRevenue + beforeRevenueDetail.totalRevenue;
		// 	currentRevenueDetails[index].percent =
		// 		(currentRevenueDetail.totalRevenue / totalRevenueDetail) * 100;
		// 	beforeRevenueDetails[indexBeforeRevenueDetail].percent =
		// 		(beforeRevenueDetail.totalRevenue / totalRevenueDetail) * 100;
		// }
		// }

		const revenueResponse = new RevenueResponse();
		revenueResponse.current = currentRevenueDetails;
		revenueResponse.before = beforeRevenueDetails;

		return revenueResponse;
	}
}
