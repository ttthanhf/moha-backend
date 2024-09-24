import { DestinationStream, LoggerOptions } from 'pino';
import { env } from './env.config';
import { ServerEnvironment } from '~constants/server.constant';

const getTimezoneOffset = (now: Date) => {
	const offset = now.getTimezoneOffset();
	const sign = offset > 0 ? '-' : '+';
	const absOffset = Math.abs(offset);
	const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
	const minutes = String(absOffset % 60).padStart(2, '0');
	return `${sign}${hours}:${minutes}`;
};

const customTimestamp = () => {
	const now = new Date();
	const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
	const seconds = String(now.getSeconds()).padStart(2, '0');
	const minutes = String(now.getMinutes()).padStart(2, '0');
	const hours = String(now.getHours()).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const year = now.getFullYear();
	const timezone = getTimezoneOffset(now);

	return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z${timezone}`;
};

const addPrettier: LoggerOptions | DestinationStream =
	env.SERVER_ENVIRONMENT == ServerEnvironment.DEVELOPMENT
		? {
				transport: {
					target: 'pino-pretty'
				}
			}
		: {};

export const pinoConfig: LoggerOptions | DestinationStream = {
	...addPrettier,
	level: env.SERVER_LOG_LEVEL,
	timestamp: () => `,"time":"${customTimestamp()}"`
};
