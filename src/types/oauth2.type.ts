export type OAUTH2_GOOGLE_TOKEN = {
	access_token: string;
	expires_in: number;
	scope: string;
	token_type: string;
	id_token: string;
	error?: string;
	error_description?: string;
};

export type OAUTH2_GOOGLE_USER_INFO = {
	sub: string;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	email: string;
	email_verified: boolean;
	hd: string;
};

export type Oauth2Client = {
	client_id: string;
	client_secret: string;
};
