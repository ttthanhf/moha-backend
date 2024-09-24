import { createSigner, createDecoder, createVerifier } from 'fast-jwt';
import { env } from '~configs/env.config';
import { JWT_CONFIG } from '~configs/jwt.config';

export class JWTUtil {
	static sign(payload: object, expiresIn: number | string = env.JWT_EXPIRE) {
		const signSync = createSigner({
			...JWT_CONFIG,
			expiresIn: expiresIn,
			mutatePayload: false
		});
		return signSync(payload);
	}
	static decode(token: string) {
		const decodeSync = createDecoder({ complete: true });
		return decodeSync(token);
	}

	static verify(token: string | number) {
		const verifySync = createVerifier({ ...JWT_CONFIG, complete: true });
		try {
			const info = verifySync(String(token));

			if (info.header.alg != env.JWT_ALGORITHM) {
				return null;
			}

			return info.payload;
		} catch {
			return null;
		}
	}
}
