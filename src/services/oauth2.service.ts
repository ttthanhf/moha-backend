import { env } from '~configs/env.config';
import { QueryString } from '~utils/query-string.util';
import {
	OAUTH2_GOOGLE_TOKEN,
	OAUTH2_GOOGLE_USER_INFO,
	Oauth2Client
} from '~types/oauth2.type';
import { AuthProviderName } from '~constants/oauth2.constant';
import { GraphQLError } from 'graphql';

export class Oauth2Service {
	private static OAUTH2: Record<AuthProviderName, Oauth2Client> = {
		google: {
			client_id: env.OAUTH2_GOOGLE_CLIENT_ID,
			client_secret: env.OAUTH2_GOOGLE_CLIENT_SECRET
		}
	} as const;

	private static async getGoogleToken(
		code: string
	): Promise<OAUTH2_GOOGLE_TOKEN> {
		const querystring = QueryString.stringify({
			code,
			client_id: this.OAUTH2[AuthProviderName.GOOGLE]['client_id'],
			client_secret: this.OAUTH2[AuthProviderName.GOOGLE]['client_secret'],
			grant_type: 'authorization_code'
		});

		const fetchData = await fetch(
			'https://oauth2.googleapis.com/token?' + querystring,
			{
				method: 'POST'
			}
		);

		const response: OAUTH2_GOOGLE_TOKEN = await fetchData.json();
		if (response.error) {
			throw new GraphQLError(
				response.error_description + ': ' + response.error
			);
		}
		return fetchData.json();
	}
	private static async getGoogleUserInfo(
		access_token: string,
		token_type: string
	): Promise<OAUTH2_GOOGLE_USER_INFO> {
		const fetchData = await fetch(
			'https://www.googleapis.com/oauth2/v3/userinfo',
			{
				headers: {
					Authorization: token_type + ' ' + access_token
				}
			}
		);
		return fetchData.json();
	}

	static async getInfoByLoginWithGoogle(code: string) {
		const tokenData = await this.getGoogleToken(code);
		const userInfo = await this.getGoogleUserInfo(
			tokenData.access_token,
			tokenData.token_type
		);

		return {
			email: userInfo.email,
			name: userInfo.name
		};
	}
}
