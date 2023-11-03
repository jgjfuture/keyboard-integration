import { ChatCompletionCreateParams } from "openai/resources";

export const ReportFunctionSignature: ChatCompletionCreateParams.Function = {
    name: "report",
    description: "Report your message to me",
    parameters: {
        type: "object",
        properties: {
            title: {
                type: "string",
                description: "The memo's title you guess. 10 to 20 characters.",
            },
            tags: {
                type: "array",
                items: {
                    type: "string",
                },
                description: "The tags of the memo you guess. Use existing tags if the tag you want to use is similar to the existing tag, so that too many tags are not created. Off course, you can use new tags.",
            },
            comment: {
                type: "string",
                description: "The comment of the memo you, a professional mentor comments. 500 to 1000 characters.",
            },
        },
        required: ["title", "tags", "comment"],
    }
}