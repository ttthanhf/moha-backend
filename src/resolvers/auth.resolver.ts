import { GraphQLError } from 'graphql';
import { AccessTokenResponse } from 'models/responses/token.response';
import { Arg, Args, Mutation, Resolver } from 'type-graphql';
import { RegisterArgs } from '~types/args/auth.arg';
import { User } from '~entities/user.entity';
import { Oauth2Service } from '~services/oauth2.service';
import { UserService } from '~services/user.service';
import { CryptoUtil } from '~utils/crypto.util';
import logger from '~utils/logger.util';
import mailUtil from '~utils/mail.util';
import { JWTUtil } from '~utils/jwt.util';
import { MapperUtil } from '~utils/mapper.util';
import { RedisService } from '~services/redis.service';
import { NumberUtil } from '~utils/number.util';

@Resolver()
export class AuthResolver {
	@Mutation(() => AccessTokenResponse)
	async register(@Args() args: RegisterArgs) {
		const user = await UserService.getUserByEmail(args.email);

		if (user) {
			logger.debug(`Email already exist`);
			throw new GraphQLError('Email already exist');
		}

		let newUser = MapperUtil.mapObjectToClass(args, User);

		newUser = await UserService.createNewUser(newUser);

		const access_token = UserService.generateUserAccessToken(newUser);

		return { access_token };
	}

	@Mutation(() => AccessTokenResponse)
	async login(@Arg('email') email: string, @Arg('password') password: string) {
		const user = await UserService.getUserByEmail(email);
		if (!user) {
			logger.debug(`User not exist`);
			throw new GraphQLError('Email or Password not correct !');
		}

		const isCorrect = await CryptoUtil.comparePassword(password, user.password);

		if (!isCorrect) {
			logger.debug(`UserId ${user?.id}: Input wrong password`);
			throw new GraphQLError('Email or Password not correct !');
		}

		const access_token = UserService.generateUserAccessToken(user);
		return { access_token };
	}

	@Mutation(() => AccessTokenResponse)
	async loginWithGoogle(@Arg('code') code: string) {
		const info = await Oauth2Service.getInfoByLoginWithGoogle(code);
		let user = await UserService.getUserByEmail(info.email);

		if (!user) {
			user = new User();
			user.email = info.email;
			user.fullName = info.name;

			user = await UserService.createNewUser(user);
		}

		const access_token = UserService.generateUserAccessToken(user);
		return { access_token };
	}

	@Mutation(() => String)
	async sendResetPasswordOTP(@Arg('email') email: string) {
		const user = await UserService.getUserByEmail(email);
		if (!user) {
			throw new GraphQLError('User not found');
		}

		await RedisService.removeOTPCodeResetPassword(email);

		const OTPCode = NumberUtil.getRandomNumberByLength(4);

		mailUtil.sendMailRecoveryPassword(email, OTPCode);

		await RedisService.setOTPCodeResetPassword(email, OTPCode);

		return 'Success';
	}

	@Mutation(() => String)
	async getTokenResetPassword(
		@Arg('OTPCode') OTPCode: string,
		@Arg('email') email: string
	) {
		const storedOTPCode = await RedisService.getOTPCodeResetPassword(email);

		if (!storedOTPCode) {
			throw new GraphQLError('OTP Code fail 1');
		}

		if (storedOTPCode != OTPCode) {
			throw new GraphQLError('OTP Code fail 2');
		}

		await RedisService.removeOTPCodeResetPassword(email);

		const token = JWTUtil.sign({
			email,
			type: 'reset-password'
		});

		await RedisService.setTokenResetPassword(token);

		return token;
	}

	@Mutation(() => String)
	async resetPassword(
		@Arg('token') token: string,
		@Arg('password') password: string
	) {
		const storedToken = await RedisService.getTokenResetPassword(token);

		if (!storedToken) {
			throw new GraphQLError('Reset password fail 1');
		}

		const tokenInfo = JWTUtil.verify(token);

		if (!tokenInfo) {
			throw new GraphQLError('Reset password fail 2');
		}

		if (tokenInfo.type != 'reset-password') {
			throw new GraphQLError('Reset password fail 3');
		}

		const user = await UserService.getUserByEmail(tokenInfo.email);

		if (!user) {
			throw new GraphQLError('Reset password fail 4');
		}

		user.password = password;

		await UserService.updateUser(user);

		await RedisService.removeTokenResetPassword(token);

		return 'Success';
	}
}
