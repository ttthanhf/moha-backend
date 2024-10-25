const { NlpManager } = require('node-nlp');
const fs = require('fs');

module.exports = class Predict {
	constructor() {
		this.manager = new NlpManager();
		this.manager.load('./model.nlp');
	}

	async predict(input) {
		return await this.manager.process(input);
	}

	async myPredict(input) {
		const likes = new Set();
		const unlikes = new Set();

		const split_words = JSON.parse(
			fs.readFileSync('./data/split_words.json')
		).split_words;

		const splitRegex = new RegExp(
			split_words
				.map((word) => {
					return word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
				})
				.join('|'),
			'g'
		);

		const splitResult = input
			.split(splitRegex)
			.filter((word) => word.trim() !== '');

		for await (const data of splitResult) {
			const result = await this.predict(data);

			if (result.intent == 'unlike') {
				result.entities.forEach((entity) => {
					if (entity.entity == 'taste') {
						unlikes.add(entity.option);
					}
				});
			} else if (result.intent == 'like') {
				result.entities.forEach((entity) => {
					if (entity.entity == 'taste') {
						likes.add(entity.option);
					}
				});
			}
		}

		return {
			likes,
			unlikes
		};
	}
};
