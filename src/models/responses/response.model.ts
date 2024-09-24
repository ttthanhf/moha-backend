import { HttpResponse } from 'uWebSockets.js';
import { HTTP_STATUS_CODE } from '~constants/http-status-code.constant';
import logger from '~utils/logger.util';

export class ResponseModel {
	private DEFAULT_SUCCESS_MESSAGE: string = 'Success';
	private DEFAULT_ERROR_MESSAGE: string = 'Something Error';
	private aborted: boolean = false;

	private response!: HttpResponse;

	statusCode: number = HTTP_STATUS_CODE.OK;
	errors: {
		message: string;
		extensions?: unknown;
	} | null = null;
	/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	data: any = null;

	constructor(response: HttpResponse) {
		this.response = response;
		this.response.onAborted(() => {
			this.aborted = true;
		});
	}

	send() {
		if (!(this.statusCode >= 200 && this.statusCode <= 299)) {
			if (this.errors?.message == this.DEFAULT_SUCCESS_MESSAGE) {
				switch (this.statusCode) {
					case HTTP_STATUS_CODE.BAD_REQUEST:
						this.errors.message = 'Bad Request';
						break;
					case HTTP_STATUS_CODE.NOT_FOUND:
						this.errors.message = 'Item not found';
						break;
					default:
						this.errors.message = this.DEFAULT_ERROR_MESSAGE;
				}
			}
		}

		if (!this.aborted) {
			this.response.cork(() => {
				this.response.writeStatus(String(this.statusCode)).end(
					JSON.stringify({
						data: this.data,
						errors: this.errors
					})
				);
				logger.info('Sended to client');
			});
		}
	}

	redirect(url: string) {
		if (!this.aborted) {
			this.response.cork(() => {
				this.response
					.writeStatus(String(HTTP_STATUS_CODE.FOUND))
					.writeHeader('Location', url)
					.end();
			});
		}
	}
}
