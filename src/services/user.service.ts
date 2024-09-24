import { User } from '~entities/user.entity';
import userRepository from '~repositories/user.repository';
import { env } from '~configs/env.config';
import { DateTimeUtil } from '~utils/datetime.util';
import { JWTUtil } from '~utils/jwt.util';
import { UserArg } from '~types/args/user.arg';
/* eslint-disable @typescript-eslint/no-explicit-any */

export class UserService {
	static async createNewUser(user: User): Promise<User> {
		return userRepository.createAndSave(user);
	}

	static async updateUser(user: User): Promise<void> {
		return userRepository.save(user);
	}

	static generateUserAccessToken(user: User) {
		const access_token = JWTUtil.sign({
			payload: {
				id: user.id
			},
			expiresIn: DateTimeUtil.calculateFutureTimestamp(env.JWT_EXPIRE)
		});
		return access_token;
	}

	static async getAllUser(fields?: any) {
		return userRepository.find({}, { fields });
	}

	static async getUserWithFilters(filters: UserArg, fields?: any) {
		return userRepository.findOne(filters, {
			fields
		});
	}

	static async getUserByEmail(email: string) {
		return userRepository.findOne({
			email
		});
	}

	static async getUserById(id: number, fields?: any) {
		return userRepository.findOne(
			{
				id
			},
			{
				fields
			}
		);
	}
}
