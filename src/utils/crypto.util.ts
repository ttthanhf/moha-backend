import { randomBytes, pbkdf2 as _pbkdf2 } from 'crypto';
import { promisify } from 'util';

const pbkdf2 = promisify(_pbkdf2);

export class CryptoUtil {
	private static pbkdf2Config = {
		splitWord: 'O',
		iterations: 10000,
		keylen: 16,
		digest: 'sha512'
	};

	static async encryptPassword(password: string) {
		const salt = randomBytes(16).toString('hex');
		const hash = (await pbkdf2(
			password,
			salt,
			this.pbkdf2Config.iterations,
			this.pbkdf2Config.keylen,
			this.pbkdf2Config.digest
		)) as Buffer;
		return `${salt}${this.pbkdf2Config.splitWord}${hash.toString('hex')}`;
	}

	static async comparePassword(rawPassword: string, hashPassword: string) {
		const [salt, hashed] = hashPassword.split(this.pbkdf2Config.splitWord);
		const hash = (await pbkdf2(
			rawPassword,
			salt,
			this.pbkdf2Config.iterations,
			this.pbkdf2Config.keylen,
			this.pbkdf2Config.digest
		)) as Buffer;
		return hashed === hash.toString('hex');
	}

	static encodeNumberTo4Number(number: number) {
		return number * 157 + 1000;
	}

	static decodeNumberTo4Number(number: number) {
		return (number - 1000) / 157;
	}
}
