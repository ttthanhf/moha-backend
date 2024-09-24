/* eslint-disable @typescript-eslint/no-explicit-any */

export class ResolverUtil {
	static getNodes(selections: any) {
		return selections
			.map((selection: any) => {
				if (selection.selectionSet) {
					const nestedFields = ResolverUtil.getNodes(
						selection.selectionSet.selections
					);
					return nestedFields.map(
						(nestedField: any) =>
							`${(selection as any).name.value}.${nestedField}`
					);
				} else {
					return (selection as any).name.value;
				}
			})
			.flat();
	}

	static getFields(selections: any, target: string) {
		const nodes = this.getNodes(selections);
		return nodes
			.map((item: string) => {
				if (item.startsWith(target)) {
					return item.replace(target, '');
				}
			})
			.filter((item: string) => item);
	}
}
