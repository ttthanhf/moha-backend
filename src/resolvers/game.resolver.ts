import { Record } from '@sinclair/typebox';
import { GraphQLError } from 'graphql';
import {
	Arg,
	Ctx,
	Field,
	ID,
	Int,
	Mutation,
	ObjectType,
	Query,
	Root,
	Subscription,
	UseMiddleware
} from 'type-graphql';
import { pubSub } from '~configs/yoga.config';
import { LocationType } from '~constants/location.constant';
import { Location } from '~entities/location.entity';
import { AuthMiddleware } from '~middlewares/auth.middleware';
import locationRepository from '~repositories/location.repository';
import { UserService } from '~services/user.service';
import { Context } from '~types/context.type';
import { GameResultInput } from '~types/inputs/game.input';
import { Question } from '~types/question.type';
import { StringUtil } from '~utils/string.util';

const question: Record<string, Question[]> = {
	drink: [
		{
			id: 1,
			type: 'distance',
			question: 'Bạn sẵn sàng đi với khoảng cách như nào?',
			options: [
				{ value: '5', label: 'dưới 5km' },
				{ value: '10', label: 'dưới 10km' },
				{ value: '15', label: 'dưới 15km' },
				{ value: '1000000', label: 'bao xa cũng đi' }
			]
		},
		{
			id: 2,
			type: 'time_of_day',
			question: 'Bạn đi vào thời gian nào trong ngày?',
			options: [
				{ value: 'morning', label: 'Buổi sáng' },
				{ value: 'noon', label: 'Buổi trưa' },
				{ value: 'afternoon', label: 'Buổi chiều' },
				{ value: 'evening', label: 'Buổi tối' }
			]
		},
		{
			id: 3,
			type: 'price',
			question: 'Bạn thích thức uống với mức giá như thế nào?',
			options: [
				{ value: '0-50000', label: 'Dưới 50,000 VND' },
				{ value: '50000-100000', label: 'Từ 50,000 - 100,000 VND' },
				{ value: '10000-200000', label: 'Từ 100,000 - 200,000 VND' },
				{
					value: '0-1000000000',
					label: 'Không quan trọng giá, miễn là phù hợp với trải nghiệm'
				}
			]
		},
		{
			id: 4,
			type: 'environment',
			question: 'Bạn thích không gian uống như thế nào?',
			options: [
				{ value: 'quiet_cafe', label: 'Quán cà phê yên tĩnh, thư giãn' },
				{
					value: 'open_space',
					label: 'Quán cà phê có không gian mở, gần gũi với thiên nhiên'
				},
				{ value: 'bar_pub', label: 'Quán bar hoặc pub sôi động' },
				{ value: 'bubble_tea', label: 'Quán trà sữa trẻ trung, năng động' }
			]
		},
		{
			id: 5,
			type: 'purpose',
			question: 'Mục đích của dịp đi uống lần này là gì?',
			options: [
				{ value: 'relax', label: 'Thư giãn, nghỉ ngơi một mình' },
				{ value: 'friends', label: 'Gặp gỡ bạn bè, trò chuyện' },
				{ value: 'dating', label: 'Hẹn hò, tạo không gian lãng mạn' },
				{
					value: 'event',
					label: 'Tổ chức sự kiện hoặc họp mặt nhóm đông người'
				}
			]
		},
		{
			id: 6,
			type: 'food',
			question: 'Khi đi uống, bạn có thích thêm các món ăn nhẹ kèm theo không?',
			options: [
				{ value: 'sweets', label: 'Có, tôi thích bánh ngọt, bánh mì' },
				{ value: 'snacks', label: 'Có, tôi thích snack hoặc đồ ăn nhanh' },
				{ value: 'drinks_only', label: 'Không, chỉ cần đồ uống là đủ' },
				{ value: 'depends', label: 'Tùy vào không gian và thời gian' }
			]
		}
	],
	play: [
		{
			id: 1,
			type: 'distance',
			question: 'Bạn sẵn sàng đi với khoảng cách như nào?',
			options: [
				{ value: '5', label: 'dưới 5km' },
				{ value: '10', label: 'dưới 10km' },
				{ value: '15', label: 'dưới 15km' },
				{ value: '1000000', label: 'bao xa cũng đi' }
			]
		},
		{
			id: 2,
			type: 'environment',
			question: 'Bạn muốn hoạt động giải trí ngoài trời hay trong nhà?',
			options: [
				{ value: 'outdoor', label: 'Ngoài trời' },
				{ value: 'indoor', label: 'Trong nhà' },
				{ value: 'no_preference', label: 'Không quan trọng, miễn là vui' }
			]
		},
		{
			id: 3,
			type: 'activity',
			question: 'Bạn thích tham gia hoạt động giải trí nào?',
			options: [
				{ value: 'theme_park', label: 'Công viên giải trí' },
				{ value: 'cinema', label: 'Rạp chiếu phim' },
				{ value: 'arcade', label: 'Trò chơi điện tử (arcade, VR)' },
				{ value: 'mall', label: 'Trung tâm mua sắm, giải trí' }
			]
		},
		{
			id: 4,
			type: 'physical_activity',
			question: 'Bạn có muốn tham gia các hoạt động thể chất không?',
			options: [
				{
					value: 'intense',
					label: 'Có, tôi thích hoạt động mạnh (leo núi, trượt băng, v.v.)'
				},
				{
					value: 'light',
					label: 'Có, nhưng chỉ nhẹ nhàng (đi bộ, công viên, v.v.)'
				},
				{ value: 'no_activity', label: 'Không, tôi muốn thư giãn' },
				{
					value: 'depends',
					label: 'Không chắc, tùy vào không gian và nhóm bạn'
				}
			]
		},
		{
			id: 5,
			type: 'duration',
			question: 'Thời gian bạn muốn dành cho hoạt động giải trí là bao lâu?',
			options: [
				{ value: 'under_2', label: 'Dưới 2 tiếng' },
				{ value: '2_4_hours', label: '2-4 tiếng' },
				{ value: 'all_day', label: 'Cả ngày' },
				{ value: 'no_limit', label: 'Không giới hạn thời gian' }
			]
		},
		{
			id: 6,
			type: 'occasion',
			question: 'Bạn đang tìm kiếm trải nghiệm phù hợp với dịp gì?',
			options: [
				{ value: 'weekend', label: 'Thư giãn cuối tuần' },
				{ value: 'friends', label: 'Tụ họp bạn bè' },
				{
					value: 'special_event',
					label: 'Kỷ niệm đặc biệt (sinh nhật, kỷ niệm)'
				},
				{ value: 'business', label: 'Gặp gỡ công việc, giao lưu' }
			]
		}
	],
	eat: [
		{
			id: 1,
			type: 'distance',
			question: 'Bạn sẵn sàng đi với khoảng cách như nào?',
			options: [
				{ value: '5', label: 'dưới 5km' },
				{ value: '10', label: 'dưới 10km' },
				{ value: '15', label: 'dưới 15km' },
				{ value: '1000000', label: 'bao xa cũng đi' }
			]
		},
		{
			id: 2,
			type: 'time_of_day',
			question: 'Bạn đang có kế hoạch đi ăn vào thời gian nào trong ngày?',
			options: [
				{ value: 'morning', label: 'Buổi sáng' },
				{ value: 'noon', label: 'Buổi trưa' },
				{ value: 'afternoon', label: 'Buổi chiều' },
				{ value: 'evening', label: 'Buổi tối' }
			]
		},
		{
			id: 3,
			type: 'cuisine',
			question: 'Bạn thích ăn loại ẩm thực nào?',
			options: [
				{ value: 'vietnamese', label: 'Ẩm thực Việt Nam' },
				{ value: 'japanese', label: 'Ẩm thực Nhật Bản' },
				{ value: 'korean', label: 'Ẩm thực Hàn Quốc' },
				{
					value: 'international',
					label: 'Ẩm thực quốc tế (châu Âu, Mỹ, v.v.)'
				}
			]
		},
		{
			id: 4,
			type: 'environment',
			question: 'Bạn muốn trải nghiệm không gian ăn uống như thế nào?',
			options: [
				{ value: 'luxury', label: 'Nhà hàng sang trọng' },
				{ value: 'casual', label: 'Quán ăn bình dân' },
				{ value: 'street_food', label: 'Quán ăn vỉa hè' },
				{ value: 'cafe', label: 'Quán cafe/thư giãn' }
			]
		},
		{
			id: 5,
			type: 'food_type',
			question: 'Khi đi ăn, bạn thường ưu tiên loại hình món ăn nào?',
			options: [
				{ value: 'grilled', label: 'Món nướng (BBQ, xiên que, v.v.)' },
				{
					value: 'fried',
					label: 'Món chiên/rán (gà rán, khoai tây chiên, v.v.)'
				},
				{
					value: 'steamed',
					label: 'Món hấp/luộc (dim sum, hải sản, v.v.)'
				},
				{ value: 'raw', label: 'Món tươi sống (sashimi, sushi, gỏi, v.v.)' }
			]
		},
		{
			id: 6,
			type: 'price',
			question: 'Bạn thích món ăn với mức giá như thế nào?',
			options: [
				{ value: '0-100000', label: 'Dưới 100,000 VND' },
				{ value: '100000-200000', label: 'Từ 100,000 - 200,000 VND' },
				{ value: '200000-500000', label: 'Từ 200,000 - 500,000 VND' },
				{
					value: '0-1000000000',
					label: 'Không quan trọng giá, miễn là phù hợp với trải nghiệm'
				}
			]
		}
	]
};
function findMostPopularSelections(inputs: GameResultInput[]) {
	const distanceCounts: Record<string, number> = {};
	const priceCounts: Record<string, number> = {};

	inputs.forEach((input) => {
		distanceCounts[input.distance] = (distanceCounts[input.distance] || 0) + 1;
		const priceRange = `${input.lowPrice}-${input.highPrice}`;
		priceCounts[priceRange] = (priceCounts[priceRange] || 0) + 1;
	});

	const mostPopularDistance = Object.keys(distanceCounts).reduce((a, b) =>
		distanceCounts[a] > distanceCounts[b] ? a : b
	);

	const mostPopularPriceRange = Object.keys(priceCounts).reduce((a, b) =>
		priceCounts[a] > priceCounts[b] ? a : b
	);

	const [lowPrice, highPrice] = mostPopularPriceRange.split('-').map(Number);

	// Output
	return {
		mostPopularDistance,
		lowPrice,
		highPrice
	};
}

@ObjectType()
class UserRoom {
	@Field(() => Int)
	id!: number;

	@Field()
	name!: string;

	@Field()
	isFinish!: boolean;
}

@ObjectType()
class Room {
	@Field()
	id: string;

	@Field(() => Int)
	ownerId: number;

	@Field()
	ownerName!: string;

	@Field(() => LocationType)
	type!: LocationType;

	results: GameResultInput[] = [];

	mutipleChoiceResult: Location[] = [];

	finderResult: Location[] = [];

	@Field(() => [UserRoom])
	users: UserRoom[] = [];
	constructor(ownerId: number, ownerName: string, type: LocationType) {
		this.id = StringUtil.generateRandomStringByCharsAndLength(8);
		this.ownerId = ownerId;
		this.ownerName = ownerName;
		this.type = type;
	}

	countFinishedUsers(): number {
		return this.users.filter((user) => user.isFinish).length;
	}

	countAllUsers() {
		return this.users.length;
	}

	isUserInThisRoom(userId: number) {
		return this.users.some((user) => user.id == userId);
	}
}

export const rooms = new Map<string, Room>();
export const joinedUserIds = new Map<number, string>();

export class GameResolver {
	@Query(() => String)
	getAllRoom() {
		const roomsArray = Array.from(rooms.entries()).map(([roomId, room]) => ({
			roomId,
			room
		}));

		return JSON.stringify(roomsArray);
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => String)
	async createRoom(@Ctx() ctx: Context, @Arg('type') type: LocationType) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('Hehe');
		}
		const room = new Room(userId, user.fullName, type);
		room.users.push({
			id: userId,
			name: user.fullName,
			isFinish: false
		});
		rooms.set(room.id, room);

		joinedUserIds.set(userId, room.id);

		return room.id;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => Boolean)
	async joinRoom(@Ctx() ctx: Context, @Arg('roomId') roomId: string) {
		const userId = ctx.res.model.data.user.id;
		const user = await UserService.getUserById(userId);
		if (!user) {
			throw new GraphQLError('User not found');
		}

		const room = rooms.get(roomId);
		if (!room) {
			throw new GraphQLError('Room not found');
		}

		const isUserInThisRoom = room.isUserInThisRoom(userId);
		if (isUserInThisRoom) {
			throw new GraphQLError('User already in this room');
		}

		room.users.push({
			id: userId,
			name: user.fullName,
			isFinish: false
		});
		joinedUserIds.set(userId, room.id);

		pubSub.publish('roomTopic', {
			roomId,
			userId,
			type: 'join',
			userName: user.fullName
		});

		return true;
	}

	@Subscription(() => String, {
		topics: ['roomTopic'],
		filter: ({ payload, args }) => payload.roomId === args.roomId
	})
	async roomTopic(
		@Root()
		payload: {
			userId: number;
			type: string;
			userName?: string;
			finishedCount?: number;
			totalUsers?: number;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			locations?: any;
			secondGame?: string;
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		@Arg('roomId', () => ID) roomId: string
	) {
		switch (payload.type) {
			case 'join':
				return JSON.stringify({
					type: 'join',
					userId: payload.userId,
					userName: payload.userName
				});
			case 'start':
				return JSON.stringify({ type: 'start' });
			case 'finish':
				return JSON.stringify({
					type: 'finish',
					userId: payload.userId,
					finishedCount: payload.finishedCount,
					totalUsers: payload.totalUsers
				});
			case 'end':
				return JSON.stringify({
					type: 'end',
					userId: payload.userId,
					finishedCount: payload.finishedCount,
					totalUsers: payload.totalUsers,
					locations: payload.locations
				});
			case 'chooseSecondGame':
				return JSON.stringify({
					type: 'chooseSecondGame',
					secondGame: payload.secondGame
				});
		}
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => String)
	async startGame(@Ctx() ctx: Context) {
		const userId = ctx.res.model.data.user.id;
		const roomId = joinedUserIds.get(userId);

		pubSub.publish('roomTopic', { roomId, userId, type: 'start' });

		return 'start';
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => String)
	async finishGame(@Ctx() ctx: Context, @Arg('input') input: GameResultInput) {
		const userId = ctx.res.model.data.user.id;
		const roomId = joinedUserIds.get(userId);

		if (!roomId) {
			throw new GraphQLError('Room not found');
		}

		const room = rooms.get(roomId);
		if (!room) {
			throw new GraphQLError('Room not found');
		}

		const userInRoom = room.users.find((user) => user.id == userId);
		if (!userInRoom) {
			throw new GraphQLError('User not in room');
		}
		room.results.push(input);
		userInRoom.isFinish = true;

		const finishedCount = room.countFinishedUsers();
		const totalUsers = room.countAllUsers();
		pubSub.publish('roomTopic', {
			roomId,
			userId,
			type: 'finish',
			finishedCount,
			totalUsers
		});

		if (totalUsers == finishedCount) {
			const selection = findMostPopularSelections(room.results);
			const locations = await locationRepository.find({
				lowPrice: {
					$gte: selection.lowPrice,
					$lte: selection.highPrice
				},
				distance: {
					$lte: Number(selection.mostPopularDistance)
				},
				type: room.type
			});

			room.mutipleChoiceResult = locations;

			pubSub.publish('roomTopic', {
				roomId,
				userId,
				type: 'end',
				finishedCount,
				totalUsers,
				locations
			});
		}

		return `Total finished users: ${finishedCount}`;
	}

	@Query(() => [Question])
	async getAllQuestion(@Arg('type') type: LocationType) {
		return question[type];
	}

	@Query(() => Room)
	async room(@Arg('id') id: string) {
		const room = rooms.get(id);
		if (!room) {
			throw new GraphQLError('Room not found');
		}

		return room;
	}

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => Boolean)
	async chooseSecondGame(
		@Ctx() ctx: Context,
		@Arg('secondGame') secondGame: string
	) {
		const userId = ctx.res.model.data.user.id;
		const roomId = joinedUserIds.get(userId);

		if (!roomId) {
			throw new GraphQLError('Room not found');
		}

		const room = rooms.get(roomId);
		if (!room) {
			throw new GraphQLError('Room not found');
		}

		pubSub.publish('roomTopic', {
			type: 'chooseSecondGame',
			secondGame
		});

		return true;
	}

	// @UseMiddleware(AuthMiddleware.LoginRequire)
	// @Mutation(() => Boolean)
	// async finishFinder(
	// 	@Ctx() ctx: Context,
	// 	@Arg('locationList', () => [Location]) locationList: Location[]
	// ) {
	// 	const userId = ctx.res.model.data.user.id;
	// 	const roomId = joinedUserIds.get(userId);

	// 	if (!roomId) {
	// 		throw new GraphQLError('Room not found');
	// 	}

	// 	const room = rooms.get(roomId);
	// 	if (!room) {
	// 		throw new GraphQLError('Room not found');
	// 	}

	// 	room.finderResult = locationList;

	// 	return true;
	// }

	@UseMiddleware(AuthMiddleware.LoginRequire)
	@Mutation(() => Location)
	async finishRandomWheel(@Ctx() ctx: Context) {
		const userId = ctx.res.model.data.user.id;
		const roomId = joinedUserIds.get(userId);

		if (!roomId) {
			throw new GraphQLError('Room not found');
		}

		const room = rooms.get(roomId);
		if (!room) {
			throw new GraphQLError('Room not found');
		}

		if (room.finderResult.length != 0) {
			const array = room.finderResult;
			const randomItem = array[Math.floor(Math.random() * array.length)];
			return randomItem;
		}

		const array = room.mutipleChoiceResult;
		const randomItem = array[Math.floor(Math.random() * array.length)];
		return randomItem;
	}
}
