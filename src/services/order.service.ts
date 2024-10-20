import { Order } from '~entities/order.entity';
import orderRepository from '~repositories/order.repository';

export class OrderService {
	static async createOrder(order: Order) {
		return orderRepository.createAndSave(order);
	}

	static async updateOrder(order: Order) {
		return orderRepository.save(order);
	}

	static async findOrderByIdAndUserId(id: number, userId: number) {
		return orderRepository.findOne({
			id: id,
			user: {
				id: userId
			}
		});
	}

	static async findNotSuccessOrderByUserIdAnd(userId: number) {
		return orderRepository.findOne({
			user: {
				id: userId
			},
			isSuccess: false
		});
	}
}