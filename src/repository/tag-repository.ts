import { Tag } from "../domain/model/page/tag/tag";

export interface TagRepository {
    getAll: () => Promise<Tag[]>;
    create: (tag: Tag) => Promise<void>;
}
