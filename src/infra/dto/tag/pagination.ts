import { Tag } from "../../../domain/model/page/tag/tag";

export type TagPagination = {
    tags: Tag[];
    hasMore: boolean;
    nextCursor: string | null;
};