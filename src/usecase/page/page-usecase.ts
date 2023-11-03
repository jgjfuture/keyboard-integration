import { WrittenPage } from "../../domain/model/page"
import { NotionRepository } from "../../repository/notion-repository"

export class PageUsecase {
    constructor(private readonly notionRepository: NotionRepository) {
        this.notionRepository = notionRepository
    }

    fetchDetectablePages = async (databaseId: string) => {
        let hasMore = true
        let nextCursor: string | null = null
        let pages: WrittenPage[] = []

        while (hasMore) {
            const response = await this.notionRepository.fetchDetectablePages(databaseId, nextCursor)
            hasMore = response.hasMore
            nextCursor = response.nextCursor
            pages = [...pages, ...response.pages]
        }

        const pagesFilled = await Promise.all(pages.map(async (page) => {
            // TODO: fetchPageDetailはページネーションなので、次のページがあれば含めるようにする
            const description = await this.notionRepository.fetchPageDetail(page.id)
            return { ...page, description }
        }))
        return pagesFilled;
    }

    fetchPage = async (pageId: string) => {
        const page = await this.notionRepository.fetchPage(pageId)
        // TODO: fetchPageDetailはページネーションなので、次のページがあれば含めるようにする
        const description = await this.notionRepository.fetchPageDetail(page.id)
        return { ...page, description }
    }

    postComment = async (pageId: string, text: string) => {
        await this.notionRepository.postComment(pageId, text)
    }

    updatePage = async (pageId: string, page: WrittenPage) => {
        await this.notionRepository.updatePage(pageId, page)
    }
}