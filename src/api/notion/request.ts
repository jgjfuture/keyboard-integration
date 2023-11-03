import { Client } from "@notionhq/client"
import { NotionRepository } from "../../repository/notion-repository"
import { WrittenPage } from "../../domain/model/page"
import { Tag, TagPagination } from "../../domain/model/tag"
import { DatabaseObjectResponse } from "@notionhq/client/build/src/api-endpoints"
import { UnknownBlock, isBulletedListBlock, isHeaderBlock, isLetterBlock } from "./notion-page-object/integration-keyboard-page"

export class NotionRepositoryImpl implements NotionRepository {

    constructor(private readonly client: Client) {
        this.client = client
    }

    fetchPage: (pageId: string) => Promise<WrittenPage> = async (pageId) => {
        const page = await this.client.pages.retrieve({
            page_id: pageId,
        })
        return this.convertPage(page)
    }

    registerTags: (databaseId: string, tags: string[]) => Promise<Tag[]> = async (databaseId, tags) => {
        return await Promise.all(tags.map(async (tag) => {
            const response = await this.client.pages.create({
                parent: {
                    database_id: databaseId,
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
                                    content: tag
                                }
                            }
                        ]
                    }
                }
            })
            return this.convertTag(response)
        }))
    }

    fetchPageDetail: (pageId: string) => Promise<string> = async (pageId) => {
        // fetch page of pageId which is included in database
        const pageChildBlockList = await this.client.blocks.children.list({
            block_id: pageId,
        })

        const document = pageChildBlockList.results.map((block) => {
            const untypedBlock = block as unknown as UnknownBlock
            if (isLetterBlock(untypedBlock)) {
                if (isHeaderBlock(untypedBlock)) {
                    return untypedBlock[untypedBlock.type].rich_text.map((text) => `# ${text.plain_text}`).join("\n")
                }
                if (isBulletedListBlock(untypedBlock)) {
                    return untypedBlock[untypedBlock.type].rich_text.map((text) => `- ${text.plain_text}`).join("\n")
                }
            }
            return ""
        }).join("\n")

        return document
    }

    postComment = async (pageId: string, text: string) => {
        await this.client.comments.create({
            parent: {
                page_id: pageId
            },
            rich_text: [
                {
                    text: {
                        content: text
                    }
                }
            ]
        })
    }

    updatePage = async (pageId: string, page: WrittenPage) => {
        await this.client.pages.update({
            page_id: pageId,
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
                    relation: page.tagIds.map((tag) => { return { id: tag } })
                },
                "integration-status": {
                    select: {
                        name: page.status
                    }
                }
            }
        })
        return page;
    }
    fetchDetectablePages = async (databaseId: string, cursor: string | null) => {
        const query = {
            database_id: databaseId,
            filter: {
                property: "integration-status",
                select: {
                    equals: "written"
                }
            },
        }
        const response = await this.client.databases.query(cursor ? { ...query, start_cursor: cursor } : query)
        const results = response.results.map((page) => this.convertPage(page as DatabaseObjectResponse))
        return {
            pages: results,
            hasMore: response.has_more,
            nextCursor: response.next_cursor
        }
    }

    fetchTags: (databaseId: string, cursor: string | null) => Promise<TagPagination> = async (databaseId, cursor) => {
        const query = {
            database_id: databaseId,
        }
        const response = await this.client.databases.query(cursor ? { ...query, start_cursor: cursor } : query)
        const results = response.results.map((tag) => this.convertTag(tag as DatabaseObjectResponse))
        return {
            tags: results,
            hasMore: response.has_more,
            nextCursor: response.next_cursor
        }
    }

    convertPage(page: any): WrittenPage {
        return {
            id: page.id,
            title: page.properties["名前"].title[0].plain_text,
            tagIds: page.properties["Tag"].relation.map((tag: { id: string }) => {
                return {
                    id: tag.id,
                }
            }),
            status: page.properties["integration-status"].select.name,
            createdAt: page.created_time,
        }
    }

    convertTag(tag: any): Tag {
        return {
            id: tag.id,
            title: tag.properties['名前'].title[0].plain_text,
        }
    }
}

