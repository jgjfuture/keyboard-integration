export interface CommentRepository {
    create: (pageId: string, text: string) => Promise<void>;
}
