import { WrittenPage, WrittenPagePagination } from "../domain/model/page";
import { Tag, TagPagination } from "../domain/model/tag";

export interface NotionRepository {
    fetchDetectablePages: (databaseId: string, cursor: string | null) => Promise<WrittenPagePagination>;
    fetchPage: (pageId: string) => Promise<WrittenPage>;
    fetchPageDetail: (pageId: string) => Promise<string>;
    fetchTags: (databaseId: string, cursor: string | null) => Promise<TagPagination>;
    registerTags: (databaseId: string, tags: string[]) => Promise<Tag[]>;
    postComment: (pageId: string, text: string) => Promise<void>;
    updatePage: (pageId: string, page: WrittenPage) => Promise<WrittenPage>;
}
