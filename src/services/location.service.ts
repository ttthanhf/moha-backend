import { LocationType } from '~constants/location.constant';
import locationRepository from '~repositories/location.repository';

export class LocationService {
	static async getLocationsByType(type: LocationType) {
		return locationRepository.find({ type: type });
	}

	static async getAllLocations(limit: number = 150) {
		return locationRepository.find({}, { limit: limit });
	}

	static async getLocationById(id: number) {
		return locationRepository.find({
			id: id
		});
	}
}
