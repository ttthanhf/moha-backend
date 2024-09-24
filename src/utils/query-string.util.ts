export class QueryString {
	static parse(queryString: string): Record<string, string> {
		const params: Record<string, string> = {};
		const pairs = queryString.split('&');
		for (const pair of pairs) {
			const index = pair.indexOf('=');
			if (index > -1) {
				const key = pair.slice(0, index);
				const value = pair.slice(index + 1);
				params[key] = value;
			} else {
				params[pair] = '';
			}
		}

		return params;
	}

	static stringify(obj: Record<string, number | string>): string {
		return Object.keys(obj)
			.map((key) => `${key}=${obj[key]}`)
			.join('&');
	}
}
