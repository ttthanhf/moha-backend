import { S3ClientConfig } from '@aws-sdk/client-s3';
import { env } from './env.config';

export const S3_CLIENT_CONFIG: S3ClientConfig = {
	endpoint: env.S3_END_POINT,
	region: env.S3_REGION,
	credentials: {
		accessKeyId: env.S3_ID,
		secretAccessKey: env.S3_KEY
	}
};
