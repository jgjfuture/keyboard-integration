// TODO: OpenAIへのアクセスはドメインの永続化ではないので、repositoryではなく、serviceに移す
import { ChatCompletionMessage } from "openai/resources";
import { Reasoned } from "../domain/model/gpt";

export interface OpenAIRepository {
    ask: (messages: ChatCompletionMessage[]) => Promise<Reasoned>;
}

