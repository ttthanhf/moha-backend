/* eslint-disable  @typescript-eslint/no-explicit-any */

import { ResponseModel } from 'models/responses/response.model';
import { HttpRequest, HttpResponse, TemplatedApp } from 'uWebSockets.js';

const methods: string[] = ['get', 'post', 'put', 'delete', 'any'];

declare module 'uWebSockets.js' {
	interface HttpResponse {
		model: ResponseModel;
	}
}

export function appConfig(app: TemplatedApp) {
	for (const method of methods) {
		/* eslint-disable-next-line  @typescript-eslint/no-unsafe-function-type */
		const original = (app as any)[method] as Function;
		(app as any)[method] = function (
			pattern: string,
			handler: (response: HttpResponse, request: HttpRequest) => void
		) {
			return original.call(
				this,
				pattern,
				(response: HttpResponse, request: HttpRequest) => {
					//make response original implement ResponseModel in all global project
					//example: res.model = new ResponseModel(res)
					response.model = new ResponseModel(response);
					handler(response, request);
				}
			);
		};
	}
}
