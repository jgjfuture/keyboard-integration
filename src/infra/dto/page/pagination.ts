import { Page } from "../../../domain/model/page/page";

export type PagePagination = {
    pages: Page[];
    hasMore: boolean;
    nextCursor: string | null;
};