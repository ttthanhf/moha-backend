export type Token = {
	/* eslint-disable-next-line  @typescript-eslint/no-explicit-any */
	payload: any;
	expiresIn?: number;
	notBefore?: number;
};
