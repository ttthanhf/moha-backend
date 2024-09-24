import { ArgsType, Field, Int } from 'type-graphql';
import { SortOrder } from '~constants/sort-order.constant';

@ArgsType()
export class PageInfoArgs {
	@Field(() => Int, { defaultValue: 9 })
	currentItem!: number;

	@Field(() => Int, { defaultValue: 1 })
	currentPage!: number;
}

@ArgsType()
export class SortOrderArgs {
	@Field({ defaultValue: 'id' })
	sort!: string;

	@Field(() => SortOrder, { defaultValue: SortOrder.ASC })
	order!: SortOrder;
}
