import { LocationType } from '~constants/location.constant';
import locationRepository from '~repositories/location.repository';

export class LocationService {
	static async getLocationsByType(type: LocationType) {
		return locationRepository.find({ type: type });
	}

	static async getAllLocations(
		limit: number = 150,
		districts?: string[],
		lowPrice?: number,
		highPrice?: number
	) {
		const lowPriceQuery = lowPrice
			? {
					lowPrice: {
						$lte: lowPrice
					}
				}
			: {};
		const highPriceQuery = highPrice
			? {
					lowPrice: {
						$gte: highPrice
					}
				}
			: {};

		const districtQuery =
			districts && districts.length != 0
				? {
						$or: districts.map((district) => ({
							address: {
								$like: `%${district}%`
							}
						}))
					}
				: {};

		return locationRepository.find(
			{
				...lowPriceQuery,
				...highPriceQuery,
				...districtQuery
			},
			{ limit: limit }
		);
	}

	static async getLocationById(ids: number[]) {
		return locationRepository.find({
			id: { $in: ids }
		});
	}
}
