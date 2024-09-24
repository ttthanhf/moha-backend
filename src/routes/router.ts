import { TemplatedApp } from 'uWebSockets.js';
import { createYoga } from 'graphql-yoga';
import { yogaConfig } from '~configs/yoga.config';

export async function routerInit(app: TemplatedApp) {
	app.any('/graphql', createYoga(yogaConfig));

	app.any('/*', (res) => {
		res.end('404');
	});
}
