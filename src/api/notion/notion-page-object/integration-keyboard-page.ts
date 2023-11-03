export type IntegrationKeyboardPage = {
    id: string;
    createdTime: string;
    properties: {
        'integration-status': {
            select: {
                name: IntegrationStatus;
            };
        };
        '名前': {
            title: {
                plain_text: string;
            }[];
        };
    };
}

export type ID = {
    prefix: string;
    number: number;
}

const integrationStatus = [
    'written',
    'detected',
    'done',
    'failed',
    'created'
] as const;
export type IntegrationStatus = typeof integrationStatus[number];

export type UnknownBlock = { type: string } & ({ [key: string]: any })
export type LetterBlock = { type: string } & { [key: string]: { rich_text: { plain_text: string }[] } }
export function isLetterBlock(block: UnknownBlock): block is LetterBlock {
    return Object.keys(block[block.type]).includes("rich_text")
}
export type HeaderBlock = { type: 'heading_1' | 'heading_2' | 'heading_3' } & { [key: string]: { rich_text: { plain_text: string }[] } }
export function isHeaderBlock(block: LetterBlock): block is HeaderBlock {
    return block.type === 'heading_1' || block.type === 'heading_2' || block.type === 'heading_3'
}
export type BulletedListBlock = { type: 'bulleted_list_item' } & { [key: string]: { rich_text: { plain_text: string }[] } }
export function isBulletedListBlock(block: LetterBlock): block is BulletedListBlock {
    return block.type === 'bulleted_list_item'
}
