import { Client } from "@notionhq/client";
import { CommentRepository } from "../../repository/comment-repository";

export class CommentRepositoryImpl implements CommentRepository {
    constructor(private readonly client: Client) {
        this.client = client
    }

    async create(pageId: string, text: string): Promise<void> {
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
}
