import { Tag } from "../../domain/model/tag"
import { NotionRepository } from "../../repository/notion-repository"

export class TagUsecase {
    constructor(private readonly notionRepository: NotionRepository) {
        this.notionRepository = notionRepository
    }

    fetchTags = async (databaseId: string) => {
        let hasMore = true
        let nextCursor: string | null = null
        let tags: Tag[] = []

        while (hasMore) {
            const response = await this.notionRepository.fetchTags(databaseId, nextCursor)
            hasMore = response.hasMore
            nextCursor = response.nextCursor
            tags = [...tags, ...response.tags]
        }

        return tags;
    }

    registerTags = async (databaseId: string, tags: string[]) => {
        return await this.notionRepository.registerTags(databaseId, tags)
    }
}
