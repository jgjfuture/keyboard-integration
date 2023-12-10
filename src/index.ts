import OpenAI from 'openai';
import { Client as NotionClient } from '@notionhq/client';
import { NotionRepositoryImpl } from './infra/notion';
import { OpenAIRepositoryImpl } from './infra/openai';
import { PageUsecase } from './usecase/page/page-usecase';
import { GPTUsecase } from './usecase/gpt/gpt-usecase';
import { TagUsecase } from './usecase/tag/tag-usecase';

async function main() {
    const notionClient = new NotionClient({
        auth: process.env.NOTION_TOKEN
    });
    const openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const pageDatabaseId = process.env.NOTION_PAGE_DATABASE_ID!;
    const tagDatabaseId = process.env.NOTION_TAG_DATABASE_ID!;
    const notionRepo = new NotionRepositoryImpl(notionClient);
    const openaiRepo = new OpenAIRepositoryImpl(openaiClient);
    const pageUsecase = new PageUsecase(notionRepo);
    const gptUsecase = new GPTUsecase(openaiRepo);
    const tagUsecase = new TagUsecase(notionRepo);

    const pages = await pageUsecase.fetchDetectablePages(pageDatabaseId)
    console.info(`fetched ${pages.length} pages`)
    const currentTags = await tagUsecase.fetchTags(tagDatabaseId)
    let currentTagsMemo = currentTags;
    for (const page of pages) {
        await pageUsecase.updatePage(page.id, { ...page, status: "detected" })
    }
    console.info(`marked ${pages.length} pages as detected`)
    for (const page of pages) {
        console.info(`processing page: ${page.id}`)
        try {
            const meta = await gptUsecase.reasoningMetas(makeJournal(page.description, page.createdAt), currentTagsMemo.map((tag) => tag.title))
            await pageUsecase.postComment(page.id, meta.comment)
            const newTagStrings = meta.tags.filter((tag) => !currentTagsMemo.map((tag) => tag.title).includes(tag))
            const existingTags = currentTagsMemo.filter((tag) => meta.tags.includes(tag.title))
            const registeredTags = await tagUsecase.registerTags(tagDatabaseId, newTagStrings)
            currentTagsMemo = [...currentTagsMemo, ...registeredTags]
            await pageUsecase.updatePage(page.id, { ...page, status: "done", tagIds: [...existingTags, ...registeredTags].map(tag => tag.id), title: meta.title })
        } catch (e) {
            console.error(e)
            await pageUsecase.updatePage(page.id, { ...page, status: "failed" })
        } finally {
            console.info(`processed page: ${page.id}`)
        }
    }
    console.info(`processed ${pages.length} pages`)
}

function makeJournal(description: string, createdAt: string): string {
    return `
        記述日時： ${createdAt}

        ${description}
    `
}

// Temporary function
async function tesetReviewPage(pageId: string, tagDatabaseId: string, pageUsecase: PageUsecase, tagUsecase: TagUsecase, gptUsecase: GPTUsecase) {
    console.log(`fetching page: ${pageId}`)
    const page = await pageUsecase.fetchPage(pageId)
    console.log(`page fetching completed`)
    if (page.status !== "written") {
        console.warn(`page is not written`)
        return
    }
    console.log(`fetching tags`)
    const currentTags = await tagUsecase.fetchTags(tagDatabaseId)
    console.log(`tags fetching completed`)
    console.log(`marking as detected page: ${pageId}`)
    await pageUsecase.updatePage(pageId, { ...page, status: "detected" })
    console.log(`marking completed`)
    try {
        console.log(`calling openAI API`)
        const meta = await gptUsecase.reasoningMetas(makeJournal(page.description, page.createdAt), currentTags.map((tag) => tag.title))
        console.log(`calling completed`)
        console.log(`posting comment`)
        await pageUsecase.postComment(pageId, meta.comment)
        console.log(`posting completed`)
        const newTagStrings = meta.tags.filter((tag) => !currentTags.map((tag) => tag.title).includes(tag))
        const existingTags = currentTags.filter((tag) => meta.tags.includes(tag.title))
        console.log(`create tags ${newTagStrings}`)
        const registeredTags = await tagUsecase.registerTags(tagDatabaseId, newTagStrings)
        console.log(`create tags completed`)
        console.log(`updating page`)
        await pageUsecase.updatePage(pageId, { ...page, status: "done", tagIds: [...registeredTags, ...existingTags].map(tag => tag.id), title: meta.title })
        console.log(`updating page completed`)
    } catch (e) {
        console.error(e)
        console.log(`marking as failed page: ${pageId}`)
        pageUsecase.updatePage(pageId, { ...page, status: "failed" })
        console.log(`marking completed`)
    }
}http://localhost:3000/

main();
