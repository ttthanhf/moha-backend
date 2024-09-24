import { PutObjectCommand } from '@aws-sdk/client-s3';
import s3Db from 'database/s3.db';
import { env } from '~configs/env.config';

export class UploadService {
	static async uploadFile(fileName: string, fileData: Buffer) {
		return s3Db.s3.send(
			new PutObjectCommand({
				Bucket: env.S3_BUCKET,
				Key: fileName,
				Body: fileData
			})
		);
	}
}
