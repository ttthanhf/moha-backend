import { parse } from '@lukeed/ms';

export class DateTimeUtil {
	static convertToMillisecond(input: string) {
		//https://github.com/lukeed/ms
		return parse(input) || 0;
	}

	static calculateFutureTimestamp(input: string) {
		return Date.now() + this.convertToMillisecond(input);
	}

	static formatDate(date: Date) {
		const day = date.getDate();
		const month = date.getMonth() + 1;
		const year = date.getFullYear();
		return `${year}-${month}-${day}`;
	}
}
