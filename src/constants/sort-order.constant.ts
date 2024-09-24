import { registerEnumType } from 'type-graphql';

export enum SortOrder {
	ASC = 'asc',
	DESC = 'DESC'
}
registerEnumType(SortOrder, {
	name: 'SortOrder'
});
