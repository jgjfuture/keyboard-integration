import { TagModel } from "../../domain/model/page/tag/tag"
import { TagRepository } from "../../repository/tag-repository"

export class TagUsecase {
    constructor(private readonly tagRepository: TagRepository) {
        this.tagRepository = tagRepository
    }

    fetchTags = async () => {
        return await this.tagRepository.getAll()
    }

    registerTags = async (tags: string[]) => {
        for (const tagString of tags) {
            const tag = TagModel.create(tagString)
            await this.tagRepository.create(tag)
        }
    }
}
