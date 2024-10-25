const { NlpManager, NlpUtil } = require('node-nlp');
const fs = require('fs');
const { removeVietnameseTones } = require('./utils/string.util');

class Train {
	constructor() {
		this.trainingFilePath = './src/chatbot/data/training.json';
		this.entityFilePath = './src/chatbot/data/entities.json';
		this.outputModelPath = './output.nlp';

		this.manager = new NlpManager({
			languages: ['vi', 'en'],
			nlu: { useStemDict: false, log: false, useNoneFeature: true },
			ner: { builtins: [] }
		});
		NlpUtil.useAutoStemmer = false;
	}

	async start() {
		await this.prepareTraining();
		await this.prepareEntity();
		await this.trainAndSave();
	}

	async trainAndSave() {
		await this.manager.train();
		// this.manager.save(this.outputModelPath);
	}

	async prepareTraining() {
		const trainData = JSON.parse(
			fs.readFileSync(this.trainingFilePath, 'utf8')
		);
		for (const item of trainData) {
			const intent = item.intent;

			for (const data of item.data) {
				const locale = data.locale;

				for (let utterance of data.data.utterances) {
					utterance = utterance.trim().toLocaleLowerCase();

					this.manager.addDocument(locale, utterance, intent);

					if (locale == 'vi') {
						this.manager.addDocument(
							locale,
							removeVietnameseTones(utterance),
							intent
						);
					}
				}

				for (let answer of data.data.answers) {
					answer = answer.trim().toLocaleLowerCase();
					this.manager.addAnswer(locale, intent, answer);
				}
			}
		}
	}

	async prepareEntity() {
		const entityData = JSON.parse(fs.readFileSync(this.entityFilePath, 'utf8'));

		for (const item of entityData) {
			const entity = item.entity;

			for (const data of item.data) {
				const name = data.name;
				const locale = data.locale;
				const utterances = data.utterances;
				this.manager.addNamedEntityText(entity, name, locale, utterances);

				if (locale == 'vi') {
					const noQuoteUtterances = utterances.map((item) =>
						removeVietnameseTones(item)
					);
					this.manager.addNamedEntityText(
						entity,
						name,
						locale,
						noQuoteUtterances
					);
				}
			}
		}
	}
}

const train = new Train();
train.start();
