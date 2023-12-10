import { Client } from "@notionhq/client";
import { TagRepository } from "../../repository/tag-repository";
import { Tag } from "../../domain/model/page/tag/tag";
import { TagPagination } from "../dto/tag/pagination";

export class TagRepositoryImpl implements TagRepository {
    constructor(private readonly client: Client, private readonly databaseId: string) {
        this.client = client
        this.databaseId = databaseId
    }

    async getAll(): Promise<Tag[]> {
        let cursor = null;
        let hasMore = true;
        const tags: Tag[] = [];
        while (hasMore) {
            const tagPagination = await this.getTagPage(cursor)
            tags.push(...tagPagination.tags)
            cursor = tagPagination.nextCursor
            hasMore = tagPagination.hasMore
        }
        return tags
    }

    private async getTagPage(cursor: string | null): Promise<TagPagination> {
        const query = {
            database_id: this.databaseId,
        }
        const response = await this.client.databases.query(cursor ? { ...query, start_cursor: cursor } : query)
        const results = response.results.map((tag) => this.convertTag(tag))
        return {
            tags: results,
            hasMore: response.has_more,
            nextCursor: response.next_cursor
        }
    }


    async create(tag: Tag): Promise<void> {
        const response = await this.client.pages.create({
            parent: {
                database_id: this.databaseId,
            },
            icon: {
                type: "external",
                external: {
                    url: 'https://www.notion.so/icons/tag_blue.svg'
                }
            },
            properties: {
                "名前": {
                    title: [
                        {
                            text: {
                                content: tag.title
                            }
                        }
                    ]
                }
            }
        })
    }

    private convertTag(tag: any): Tag {
        return {
            id: tag.id,
            title: tag.properties['名前'].title[0].plain_text,
        }
    }

}
