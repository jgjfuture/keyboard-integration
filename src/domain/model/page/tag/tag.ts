export type Tag = {
    title: string;
}

export class TagModel implements Tag {
    title: string

    constructor(tag: string) {
        this.title = tag
    }

    static create(tag: string) {
        return new TagModel(tag)
    }
}