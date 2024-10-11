export class StringUtil {
	private static CHARS_DEFAULT =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	static generateRandomStringByCharsAndLength(
		length: number,
		characters: string = this.CHARS_DEFAULT
	) {
		let result = '';
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}
}
