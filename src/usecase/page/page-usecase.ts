import { PageModel } from "../../domain/model/page/page"
import { PageRepository } from "../../repository/page-repositoty"

export type PageOutput = {
    id: string
    title: string
    description: string
    integrationStatus: string
}

export type UpdatePageInput = {
    id : string
    title: string
    description: string
    tagIds: string[]
}

export class PageUsecase {
    constructor(private readonly pageRepository: PageRepository) {
        this.pageRepository = pageRepository
    }

    fetchDetectablePages = async () => {
        const pages = await this.pageRepository.getAllWritten()
        return pages
    }

    async update(input: UpdatePageInput) {
        const page = new PageModel(input.id, input.title, input.description, input.tagIds, input.integrationStatus)
        await this.pageRepository.update()
    }
}
