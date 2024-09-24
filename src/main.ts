import * as uWS from 'uWebSockets.js';
import { appConfig } from '~configs/app.config';
import { env } from '~configs/env.config';
import { routerInit } from '~routes/router';
import logger from '~utils/logger.util';

logger.info(
	`Server starting at PORT: ${env.SERVER_PORT} with LOG_LEVEL: ${env.SERVER_LOG_LEVEL}`
);

const app = uWS.App();

appConfig(app);
routerInit(app);

app.listen(env.SERVER_PORT, () => {
	logger.info('Server Started');
});
