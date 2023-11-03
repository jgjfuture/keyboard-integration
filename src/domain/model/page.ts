import { Tag } from "./tag";

export type WrittenPage = {
    id: string;
    title: string;
    description?: string;
    tagIds: string[];
    status: IntegrationStatus;
    createdAt: string;
}

export type WrittenPagePagination = {
    pages: WrittenPage[];
    hasMore: boolean;
    nextCursor: string | null;
}

const integrationStatus = [
    "created",
    "written",
    "detected",
    "done",
    "failed"
] as const;

export type IntegrationStatus = typeof integrationStatus[number]
