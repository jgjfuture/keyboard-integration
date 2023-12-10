import { Tag } from "./tag/tag";

export type Page = {
    id: string;
    title: string;
    description: string;
    tags?: Tag[];
    status: IntegrationStatus;
}

const integrationStatus = [
    "created",
    "written",
    "detected",
    "done",
    "failed"
] as const;

export type IntegrationStatus = typeof integrationStatus[number]

export class PageModel implements Page {
    id: string
    title: string
    description: string
    tags?: Tag[]
    status: IntegrationStatus

    constructor(id: string, title: string, description: string, tags: Tag[], status: IntegrationStatus) {
        this.id = id
        this.title = title
        this.description = description
        this.tags = tags
        this.status = status
    }
}