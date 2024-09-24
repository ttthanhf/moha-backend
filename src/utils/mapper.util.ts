export class MapperUtil {
	static mapObjectToClass<S extends object, T extends object>(
		objectDTO: S,
		ClassDTO: new () => T
	): T {
		const classDTO = new ClassDTO();
		Object.keys(classDTO).forEach((key) => {
			if (key in objectDTO) {
				/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
				(classDTO as any)[key] = (objectDTO as any)[key];
			}
		});

		return classDTO;
	}
}
