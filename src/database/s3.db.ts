import { S3Client } from '@aws-sdk/client-s3';
import { S3_CLIENT_CONFIG } from '~configs/s3.config';

class S3DB {
	s3!: S3Client;

	constructor() {
		if (!this.s3) {
			this.s3 = new S3Client(S3_CLIENT_CONFIG);
		}
	}
}

export default new S3DB();
