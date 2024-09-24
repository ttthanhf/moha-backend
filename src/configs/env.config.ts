import envSchema from 'env-schema';
import { EnvType, envTypeSchema } from 'models/schemas/env.schema';

export const env = envSchema<EnvType>({
	schema: envTypeSchema,
	dotenv: true,
	expandEnv: true
});
