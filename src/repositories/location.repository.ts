import { Location } from '~entities/location.entity';
import { BaseRepository } from './base.repository';

class LocationRepository extends BaseRepository<Location> {
	constructor() {
		super(Location);
	}
}

export default new LocationRepository();
