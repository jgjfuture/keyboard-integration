import { Page } from "../domain/model/page/page";

export interface PageRepository {
    getAllWritten: () => Promise<Page[]>;
    get: (pageId: string) => Promise<Page>;
    update: (page: Page) => Promise<void>;
}
