import { parse } from '@lukeed/ms';

export class DateTimeUtil {
	static convertToMillisecond(input: string) {
		//https://github.com/lukeed/ms
		return parse(input) || 0;
	}

	static calculateFutureTimestamp(input: string) {
		return Date.now() + this.convertToMillisecond(input);
	}
}
