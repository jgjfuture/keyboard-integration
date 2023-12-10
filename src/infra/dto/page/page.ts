// 以下を満たす実装
// import { UnknownBlock, isBulletedListBlock, isHeaderBlock, isLetterBlock, isTodoListBlock } from "../dto/page/page";

export type UnknownBlock = {
    [key: string]: any;
    type: string;
};

export type BulletedListBlock = {
    type: "bulleted_list_item";
    bulleted_list_item: {
        rich_text: {
            plain_text: string;
        }[];
    };
} & UnknownBlock;

export type HeaderBlock = {
    type: "header";
    header: {
        rich_text: {
            plain_text: string;
        }[];
    };
} & UnknownBlock;

export type TodoListBlock = {
    type: "to_do";
    to_do: {
        rich_text: {
            plain_text: string;
        }[];
    };
} & UnknownBlock;

export type LetterBlock = BulletedListBlock | HeaderBlock | TodoListBlock;

export const isLetterBlock = (block: UnknownBlock): block is LetterBlock => {
    return block.type === "bulleted_list_item" || block.type === "header" || block.type === "to_do";
}

export const isBulletedListBlock = (block: UnknownBlock): block is BulletedListBlock => {
    return block.type === "bulleted_list_item";
}

export const isHeaderBlock = (block: UnknownBlock): block is HeaderBlock => {
    return block.type === "header";
}

export const isTodoListBlock = (block: UnknownBlock): block is TodoListBlock => {
    return block.type === "to_do";
}
