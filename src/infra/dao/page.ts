import { Client } from "@notionhq/client";
import { PageRepository } from "../../repository/page-repositoty";
import { Page } from "../../domain/model/page/page";
import { UnknownBlock, isBulletedListBlock, isHeaderBlock, isLetterBlock, isTodoListBlock } from "../dto/page/page";
import { PagePagination } from "../dto/page/pagination";

export class PageRepositoryImpl implements PageRepository {
    constructor(private readonly client: Client, private readonly databaseId: string) {
        this.client = client
        this.databaseId = databaseId
    }

    async getAllWritten(): Promise<Page[]> {
        let cursor = null;
        let hasMore = true;
        const pages: Page[] = [];
        while (hasMore) {
            const pagePagination = await this.getPagePage(cursor)
            pages.push(...pagePagination.pages)
            cursor = pagePagination.nextCursor
            hasMore = pagePagination.hasMore
        }
        return pages
    }

    private async getPagePage(cursor: string | null): Promise<PagePagination> {
        const query = {
            database_id: this.databaseId,
            filter: {
                property: "integration-status",
                select: {
                    equals: "written"
                }
            },
        }
        const response = await this.client.databases.query(cursor ? { ...query, start_cursor: cursor } : query)
        const results = await Promise.all(response.results.map(async (pageResponse) => {
            const description = await this.getDetail(pageResponse.id);
            return this.convertPage(pageResponse, description);
        }))
        return {
            pages: results,
            hasMore: response.has_more,
            nextCursor: response.next_cursor
        }
    }

    async get(pageId: string): Promise<Page> {
        const page = await this.client.pages.retrieve({
            page_id: pageId,
        })
        const description = await this.getDetail(pageId);
        return this.convertPage(page, description);
    }

    private async getDetail(pageId: string): Promise<string> {
        const blockId = pageId;
        const pageChildBlockList = await this.client.blocks.children.list({
            block_id: blockId,
        })

        const document = await Promise.all(pageChildBlockList.results.map(async (block) => {
            const untypedBlock = block as unknown as UnknownBlock
            if (isLetterBlock(untypedBlock)) {
                if (isHeaderBlock(untypedBlock)) {
                    return untypedBlock[untypedBlock.type].rich_text.map((text) => `# ${text.plain_text}`).join("\n")
                }
                if (isBulletedListBlock(untypedBlock)) {
                    const listChildren = await this.getDetail(block.id)
                    const currentItem = untypedBlock[untypedBlock.type].rich_text.map((text) => `- ${text.plain_text}`).join("\n")
                    if (listChildren === "") {
                        return currentItem
                    }
                    const listChildrenIndented = listChildren.split("\n").map((line) => `  ${line}`).join("\n")
                    return `${currentItem}\n${listChildrenIndented}`
                }
                if (isTodoListBlock(untypedBlock)) {
                    const listChildren = await this.getDetail(block.id)
                    const currentItem = untypedBlock[untypedBlock.type].rich_text.map((text) => `- [ ] ${text.plain_text}`).join("\n")
                    if (listChildren === "") {
                        return currentItem
                    }
                    const listChildrenIndented = listChildren.split("\n").map((line) => `  ${line}`).join("\n")
                    return `${currentItem}\n${listChildrenIndented}`
                }
            }
            return ""
        })).then((blocks) => blocks.join("\n"))
        return document
    }

    async update(page: Page): Promise<void> {
        await this.client.pages.update({
            page_id: page.id,
            properties: {
                title: {
                    title: [
                        {
                            text: {
                                content: page.title
                            }
                        }
                    ]
                },
                Tag: {
                    relation: page.tags?.map((tag) => { return { id: tag.id } }) || []
                },
                "integration-status": {
                    select: {
                        name: page.status
                    }
                }
            }
        })
    }

    private convertPage(page: any, description: string): Page {
        return {
            id: page.id,
            title: page.properties["名前"].title[0].plain_text,
            description: description,
            status: page.properties["integration-status"].select.name,
        }
    }
}
