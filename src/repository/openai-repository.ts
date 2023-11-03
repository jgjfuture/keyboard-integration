import { ChatCompletionMessage } from "openai/resources";
import { Reasoned } from "../domain/model/gpt";

export interface OpenAIRepository {
    ask: (messages: ChatCompletionMessage[]) => Promise<Reasoned>;
}

