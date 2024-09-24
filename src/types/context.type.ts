import { YogaInitialContext } from 'graphql-yoga';
import { HttpResponse } from 'uWebSockets.js';

export type Context = YogaInitialContext & {
	res: HttpResponse;
};
