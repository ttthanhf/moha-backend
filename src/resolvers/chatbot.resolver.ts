import { Arg, Ctx, Mutation, UseMiddleware } from 'type-graphql';
import { Context } from '~types/context.type';
import Predict from '../chatbot/predict';
import { LocationService } from '~services/location.service';
import { LocationType } from '~constants/location.constant';
import { ChatbotResponse } from 'models/responses/chatbot.model';
import { AuthMiddleware } from '~middlewares/auth.middleware';
import { UserService } from '~services/user.service';
import { GraphQLError } from 'graphql';
import { env } from '~configs/env.config';
import { GeminiResponse } from '~types/gemini.type';
import { BotInput, HyperChatBotInput } from '~types/inputs/chatbot.input';

export class ChatBotResolver {
	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => ChatbotResponse)
	async sendChat(@Ctx() ctx: Context, @Arg('message') message: string) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Hehe');
		}

		const response = new ChatbotResponse();
		response.isShowLocation = false;

		const predict = new Predict();
		const responsePredict = await predict.predict(message);
		if (responsePredict.intent == 'greeting') {
			response.message = responsePredict.answer;

			return response;
		} else if (responsePredict.intent == 'eat') {
			const locations = await LocationService.getLocationsByType(
				LocationType.EAT
			);

			response.isShowLocation = true;
			response.locations = locations;
			response.message = responsePredict.answer;

			return response;
		} else if (responsePredict.intent == 'drink') {
			const locations = await LocationService.getLocationsByType(
				LocationType.DRINK
			);

			response.isShowLocation = true;
			response.locations = locations;
			response.message = responsePredict.answer;

			return response;
		} else if (responsePredict.intent == 'play') {
			const locations = await LocationService.getLocationsByType(
				LocationType.PLAY
			);

			response.isShowLocation = true;
			response.locations = locations;
			response.message = responsePredict.answer;

			return response;
		} else if (responsePredict.intent == 'whatismyname') {
			response.message = responsePredict.answer + ' ' + user.fullName;

			return response;
		}
		response.message = 'Xin lỗi, tôi không hiểu bạn đang nói gì';
		return response;
	}

	@Mutation(() => ChatbotResponse)
	async sendChatSuperMode(
		@Ctx() ctx: Context,
		@Arg('message', () => [String]) message: [string]
	) {
		// const userId = ctx.res.model.data.user.id;
		// const user = await UserService.getUserById(userId);
		// if (!user) {
		// 	throw new GraphQLError('Hehe');
		// }

		const locations = await LocationService.getAllLocations(180);

		const response = new ChatbotResponse();
		response.isShowLocation = false;

		const userMessage = message.map((item) => ({ text: item }));

		try {
			const responseFetch = await fetch(
				'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' +
					env.GEMINI_KEY,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						contents: [
							{
								parts: [
									{
										text: 'Hãy luôn ghi nhớ rằng bạn là ChatBot tên Doko thuộc công ty Moha thuộc quyền sở hữu của Tập đoàn 3T. Bạn chỉ trả lời những câu hỏi liên quan tới vấn đề lựa chọn địa điểm. Mọi câu hỏi ngoài lề thì bạn phải từ chối trả lời do không hiểu. Và chỉ khi nào người dùng hỏi thì về thông tin thì mới trả lời còn không thì không trả lời. Bạn hãy trả lời câu hỏi tiếp theo thôi:'
									},
									{
										text:
											'Hãy chỉ trả lời địa điểm trong danh sách sau và không được trả lời bất kì địa điểm nào khác: ' +
											JSON.stringify(
												locations.map((item) => ({
													id: item.id,
													name: item.name,
													address: item.address,
													lowPrice: item.lowPrice,
													highPrice: item.highPrice
												}))
											)
									},
									{
										text: 'Nhiệm vụ của bạn là đưa ra gợi ý địa điểm phù hợp nhất cho người dùng và không được hỏi người dùng. Hãy trả lời vì sao chọn địa điểm đó cho người dùng và phân tích nó với lại câu người dùng đã hỏi để thuyết phục người dùng đó là lựa chọn đúng. Và nếu không có lựa chọn nào phù hợp thì phải nói là hiện tại tôi chưa đưa ra được sự lựa chọn nào phù hợp với nhu cầu của bạn. Còn nếu hỏi những vấn đề không liên quan đến địa điểm thì vẫn trả lời bình thường'
									},
									{
										text: 'Hãy trả lời thật tự nhiên mà không bị gò bó như đã học từ chữ'
									},
									{
										text: 'Tôi cần bạn trả lời theo format như sau, luôn tuân thủ theo format: `{ids: List<id của địa điểm đó>, message: <Nội dung bạn sẽ trả lời tôi>}`. Không được trả lời theo format khác mà tôi đã đưa ra> Nếu như câu hỏi không có id thì mặc định id là null. Khi trả lời địa điểm cho người dùng nếu không được yêu cầu là đưa ra danh sách bao nhiêu địa điểm thì chỉ gợi ý ba địa điểm phù hợp nhất.'
									},
									...userMessage
								]
							}
						]
					}),
					redirect: 'follow'
				}
			);
			const resultFetch: GeminiResponse = await responseFetch.json();

			const chatbotResponse = resultFetch.candidates[0].content.parts[0].text;

			const chatbotMessage = JSON.parse(
				chatbotResponse.replace(/```json|```/g, '').trim()
			);

			// console.log(chatbotMessage);

			if (chatbotMessage.ids) {
				const localtions = await LocationService.getLocationById(
					chatbotMessage.ids
				);
				if (localtions.length != 0) {
					response.isShowLocation = true;
					response.locations = localtions;
				}
			}

			response.message = chatbotMessage.message;
		} catch {
			response.message =
				'Đã vượt quá khả năng xử lý của Doko mất rồi T_T . Bạn hãy xóa trí nhớ của Doko và thử lại xem nhé';
		}

		return response;
	}

	@Mutation(() => ChatbotResponse)
	async sendChatHyperMode(
		@Arg('input', () => [HyperChatBotInput]) input: [HyperChatBotInput]
	) {
		// const userId = ctx.res.model.data.user.id;
		// const user = await UserService.getUserById(userId);
		// if (!user) {
		// 	throw new GraphQLError('Hehe');
		// }

		const contents = input.map((item) => ({
			role: item.role,
			parts: [
				{
					text: item.message
				}
			]
		}));

		const locations = await LocationService.getAllLocations(150);

		const response = new ChatbotResponse();
		response.isShowLocation = false;
		response.isError = false;

		try {
			const responseFetch = await fetch(
				'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' +
					env.GEMINI_KEY,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						system_instruction: {
							parts: [
								{
									text: 'Hãy luôn ghi nhớ rằng bạn là ChatBot tên Doko thuộc công ty Moha thuộc quyền sở hữu của Tập đoàn 3T. Bạn chỉ trả lời những câu hỏi liên quan tới vấn đề lựa chọn địa điểm. Mọi câu hỏi ngoài lề thì bạn phải từ chối trả lời do không hiểu. Và chỉ khi nào người dùng hỏi thì về thông tin thì mới trả lời còn không thì không trả lời. Bạn hãy trả lời câu hỏi tiếp theo thôi:'
								},
								{
									text:
										'Hãy chỉ trả lời địa điểm trong danh sách sau và không được trả lời bất kì địa điểm nào khác: ' +
										JSON.stringify(
											locations.map((item) => ({
												id: item.id,
												name: item.name,
												address: item.address,
												lowPrice: item.lowPrice,
												highPrice: item.highPrice
											}))
										)
								},
								{
									text: 'Nhiệm vụ của bạn là đưa ra gợi ý địa điểm phù hợp nhất cho người dùng và không được hỏi người dùng. Hãy trả lời vì sao chọn địa điểm đó cho người dùng và phân tích nó với lại câu người dùng đã hỏi để thuyết phục người dùng đó là lựa chọn đúng. Và nếu không có lựa chọn nào phù hợp thì phải nói là hiện tại tôi chưa đưa ra được sự lựa chọn nào phù hợp với nhu cầu của bạn. Còn nếu hỏi những vấn đề không liên quan đến địa điểm thì vẫn trả lời bình thường'
								},
								{
									text: 'Hãy trả lời thật tự nhiên mà không bị gò bó như đã học từ chữ. Trả lời với đại từ nhân xưng tự nhiên'
								},
								{
									text: 'Tôi cần bạn trả lời theo format như sau, luôn tuân thủ theo format: \n `{ids: List<id của địa điểm đó>, message: <Nội dung bạn sẽ trả lời tôi>}`. Không được trả lời theo format khác mà tôi đã đưa ra> Nếu như câu hỏi không có id thì mặc định id là null. Khi trả lời địa điểm cho người dùng nếu không được yêu cầu là đưa ra danh sách bao nhiêu địa điểm thì chỉ gợi ý ba địa điểm phù hợp nhất. Bắt buộc output đầu ra là theo format không được để chuỗi thường'
								}
							]
						},
						contents: [...contents]
					}),
					redirect: 'follow'
				}
			);
			const resultFetch: GeminiResponse = await responseFetch.json();

			const chatbotResponse = resultFetch.candidates[0].content.parts[0].text;

			// console.log(chatbotResponse);

			const chatbotMessage = JSON.parse(
				chatbotResponse.replace(/```json|```/g, '').trim()
			);

			// console.log(chatbotMessage);

			if (chatbotMessage.ids) {
				const localtions = await LocationService.getLocationById(
					chatbotMessage.ids
				);

				if (localtions.length != 0) {
					response.isShowLocation = true;
					response.locations = localtions;
				}
			}

			response.message = chatbotMessage.message;
		} catch {
			response.isError = true;
			response.message =
				'Đã vượt quá khả năng xử lý của Doko mất rồi T_T . Bạn hãy xóa trí nhớ của Doko và thử lại xem nhé';
		}

		return response;
	}

	@Mutation(() => ChatbotResponse)
	async sendChatUltraMode(@Arg('input', () => [BotInput]) input: [BotInput]) {
		const contents = input.map((item) => ({
			role: item.role,
			parts: [
				{
					text: item.message
				}
			]
		}));

		const unknownNameFetchData = await fetch(
			'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' +
				env.GEMINI_KEY,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					system_instruction: {
						parts: [
							{
								text: 'Tôi cần bạn trả lời theo format như sau, luôn tuân thủ theo format: \n `{"districts": List<quận của user đã nhập>, "lowPrice": <Giá thấp nhất mà user mong muốn>, "highPrice": <Giá cao nhất mà user mong muốn>}` \n.Bắt buộc output đầu ra là theo format không được để chuỗi thường. Nếu như user có mong muốn thì giá trị là null cho trường đó. Nếu quận có số thì thêm từ quận vào, nếu không có số thì chỉ cần tên thôi'
							}
						]
					},
					contents: [contents[contents.length - 1]]
				}),
				redirect: 'follow'
			}
		);

		const resultUnknownNameFetchData: GeminiResponse =
			await unknownNameFetchData.json();

		const chatbotResponseUnknownName =
			resultUnknownNameFetchData.candidates[0].content.parts[0].text;

		const chatbotMessageUnknownName = JSON.parse(
			chatbotResponseUnknownName.replace(/```json|```/g, '').trim()
		);

		const locations = await LocationService.getAllLocations(
			150,
			chatbotMessageUnknownName.districts,
			chatbotMessageUnknownName.lowPrice,
			chatbotMessageUnknownName.highPrice
		);

		const response = new ChatbotResponse();
		response.isShowLocation = false;
		response.isError = false;

		try {
			const responseFetch = await fetch(
				'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=' +
					env.GEMINI_KEY,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						system_instruction: {
							parts: [
								{
									text: 'Hãy luôn ghi nhớ rằng bạn là ChatBot tên Doko thuộc công ty Moha thuộc quyền sở hữu của Tập đoàn 3T. Bạn chỉ trả lời những câu hỏi liên quan tới vấn đề lựa chọn địa điểm. Mọi câu hỏi ngoài lề thì bạn phải từ chối trả lời do không hiểu. Và chỉ khi nào người dùng hỏi thì về thông tin thì mới trả lời còn không thì không trả lời. Bạn hãy trả lời câu hỏi tiếp theo thôi:'
								},
								{
									text:
										'Hãy chỉ trả lời địa điểm trong danh sách sau và không được trả lời bất kì địa điểm nào khác: ' +
										JSON.stringify(
											locations.map((item) => ({
												id: item.id,
												name: item.name,
												address: item.address,
												lowPrice: item.lowPrice,
												highPrice: item.highPrice
											}))
										)
								},
								{
									text: 'Nhiệm vụ của bạn là đưa ra gợi ý địa điểm phù hợp nhất cho người dùng và không được hỏi người dùng. Hãy trả lời vì sao chọn địa điểm đó cho người dùng và phân tích nó với lại câu người dùng đã hỏi để thuyết phục người dùng đó là lựa chọn đúng. Và nếu không có lựa chọn nào phù hợp thì phải nói là hiện tại tôi chưa đưa ra được sự lựa chọn nào phù hợp với nhu cầu của bạn. Còn nếu hỏi những vấn đề không liên quan đến địa điểm thì vẫn trả lời bình thường'
								},
								{
									text: 'Hãy trả lời thật tự nhiên mà không bị gò bó như đã học từ chữ. Trả lời với đại từ nhân xưng tự nhiên'
								},
								{
									text: 'Tôi cần bạn trả lời theo format như sau, luôn tuân thủ theo format: \n `{ids: List<id của địa điểm đó>, message: <Nội dung bạn sẽ trả lời tôi>}`. Không được trả lời theo format khác mà tôi đã đưa ra> Nếu như câu hỏi không có id thì mặc định id là null. Khi trả lời địa điểm cho người dùng nếu không được yêu cầu là đưa ra danh sách bao nhiêu địa điểm thì chỉ gợi ý ba địa điểm phù hợp nhất. Bắt buộc output đầu ra là theo format không được để chuỗi thường'
								}
							]
						},
						contents: [...contents]
					}),
					redirect: 'follow'
				}
			);
			const resultFetch: GeminiResponse = await responseFetch.json();

			const chatbotResponse = resultFetch.candidates[0].content.parts[0].text;

			console.log(chatbotResponse);

			try {
				const chatbotMessage = JSON.parse(
					chatbotResponse.replace(/```json|```/g, '').trim()
				);
				if (chatbotMessage.ids) {
					const localtions = await LocationService.getLocationById(
						chatbotMessage.ids
					);
					if (localtions.length != 0) {
						response.isShowLocation = true;
						response.locations = localtions;
					}
				}

				response.message = chatbotMessage.message;
			} catch {
				response.message = chatbotResponse;
			}

			// console.log(chatbotMessage);
		} catch {
			response.isError = true;
			response.message =
				'Đã vượt quá khả năng xử lý của Doko mất rồi T_T . Bạn hãy xóa trí nhớ của Doko và thử lại xem nhé';
		}

		return response;
	}
}
