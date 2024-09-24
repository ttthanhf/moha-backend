import redisDb from 'database/redis.db';

export class RedisService {
	private static OTP_CODE_RESET_PASSWORD_HEAD = 'OPT_CODE_RESET_PASSWORD-';
	private static TOKEN_RESET_PASSWORD_HEAD = 'TOKEN_CODE_RESET_PASSWORD-';

	static async setOTPCodeResetPassword(email: string, OTPCode: number) {
		return redisDb.redis.set(
			this.OTP_CODE_RESET_PASSWORD_HEAD + email,
			OTPCode,
			'EX',
			60 * 15,
			'NX'
		);
	}

	static async getOTPCodeResetPassword(email: string) {
		return redisDb.redis.get(this.OTP_CODE_RESET_PASSWORD_HEAD + email);
	}

	static async removeOTPCodeResetPassword(email: string) {
		return redisDb.redis.del(this.OTP_CODE_RESET_PASSWORD_HEAD + email);
	}

	static async setTokenResetPassword(token: string) {
		return redisDb.redis.set(
			this.TOKEN_RESET_PASSWORD_HEAD + token,
			'1',
			'EX',
			60 * 5,
			'NX'
		);
	}

	static async getTokenResetPassword(token: string) {
		return redisDb.redis.get(this.TOKEN_RESET_PASSWORD_HEAD + token);
	}

	static async removeTokenResetPassword(token: string) {
		return redisDb.redis.del(this.TOKEN_RESET_PASSWORD_HEAD + token);
	}
}
