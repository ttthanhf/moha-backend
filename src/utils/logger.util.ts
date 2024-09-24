import pino from 'pino';
import { pinoConfig } from '~configs/pino.config';

const logger = pino(pinoConfig);

export default logger;
