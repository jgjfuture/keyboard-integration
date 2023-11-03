export type Tag = {
    id: string;
    title: string;
}

export type TagPagination = {
    tags: Tag[];
    hasMore: boolean;
    nextCursor: string | null;
}
