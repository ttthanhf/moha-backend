import { PageInfoArgs } from '~types/args/pagination.arg';

export class PaginationUtil {
	static avoidTrashInput(pageInfoArgs: PageInfoArgs) {
		const currentPage = pageInfoArgs.currentPage - 1;
		const currentItem = pageInfoArgs.currentItem;
		const limit = currentItem <= 0 ? 1 : currentItem;
		const offset = currentPage < 0 ? 0 : currentPage;
		return {
			limit,
			offset
		};
	}
}
