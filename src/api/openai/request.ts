import OpenAI from "openai";
import { OpenAIRepository } from "../../repository/openai-repository";
import { Reasoned } from "../../domain/model/gpt";
import { ReportFunctionSignature } from "./functions/report";
import { ChatCompletionMessage } from "openai/resources";

export class OpenAIRepositoryImpl implements OpenAIRepository {
    constructor(private readonly client: OpenAI) {
        this.client = client
    }

    ask = async (messages: ChatCompletionMessage[]): Promise<Reasoned> => {
        const response = await this.client.chat.completions.create({
            model: "gpt-4",
            messages: messages,
            function_call: { name: ReportFunctionSignature.name },
            functions: [
                ReportFunctionSignature
            ],
        });
        if (response.choices[0].finish_reason !== "stop") {
            throw new Error("finish_reason is not stop")
        }
        if (response.choices[0].message.function_call?.name !== ReportFunctionSignature.name) {
            throw new Error("function_call.name is not expected")
        }
        const args = response.choices[0].message.function_call.arguments
        // remove all control charactor from json string
        const sanitizedArgs = args.replace(/[\u0000-\u0019]+/g, "")
        const parsedArgs = JSON.parse(sanitizedArgs)
        return parsedArgs;
    }
}
