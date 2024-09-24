import { Algorithm, SignerOptions } from 'fast-jwt';
import { env } from './env.config';

export const JWT_CONFIG: Partial<SignerOptions & { key: string }> = {
	key: env.JWT_KEY,
	algorithm: env.JWT_ALGORITHM as Algorithm
};
