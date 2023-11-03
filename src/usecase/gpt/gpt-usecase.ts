import { ChatCompletionMessage } from "openai/resources";
import { OpenAIRepository } from "../../repository/openai-repository";
import { Reasoned } from "../../domain/model/gpt";

export class GPTUsecase {
    constructor(private readonly gptRepository: OpenAIRepository) {
        this.gptRepository = gptRepository
    }
    reasoningMetas = async (text: string, currentTags: string[]): Promise<Reasoned> => {
        const messages: ChatCompletionMessage[] = [
            {
                role: "system",
                content: `
                    あなたはプロのメンタルコーチです。
                    あなたはメンタルヘルスに関する専門的な知識に加え、体の健康に関する専門的な知識、それから、ジャーナリングやメンタルヘルスに関するワークショップの実施に関する専門的な知識を持っています。
                    加えてあなたは、コーチングやカウンセリングの専門的な知識を有しています。
                    あなたは、あなたのクライアントに対して自分の頭に浮かんだ事柄を決められた時間でできるだけ多く書いてもらうようなワークを実施しました。
                    あなたの仕事は、クライアントが書いたものを読んで専門的な観点やメンタルコーチとしてのフィードバックを提供することに加えて、
                    クライアントが書いた文章をクライアントがあとから整理しやすいように、特定の操作を施すことです。
                `
            },
            {
                role: "user",
                content: `
                    これから私が書いたジャーナリングの文章を渡すので、それを読んで、次の3つのことを私に報告してください。
                    1. 文章を簡潔に表現したタイトル（10 ~ 20文字程度）
                    2. 文章を後で整理するためのタグ（ハッシュタグのようなものですが、ハッシュは不要です。まずは既存のタグを考慮せずにタグをつけてください。大きなレベルの概念だけでなく、詳細なレベルでタグをつけて構いません。そのあと、その一部に既存のタグに似たものがある場合はそちらを使用してください。これはタグが乱立しないようにする意味を込めています。）
                    3. メンタルコーチとしてのフィードバック(1000文字程度)
                `
            },
            {
                role: "assistant",
                content: `
                    承知しました。では、既にあるタグを教えていただけますか？
                `
            },
            {
                role: "user",
                content: `
                    以下が既存のタグです。

                    ${currentTags.map(tag => `- ${tag}`).join("\n")}
                `
            },
            {
                role: "assistant",
                content: `
                    ありがとうございます。基本的には既存のタグを考慮せずにタグを考えます。その後もしそれが既存のタグと似ている場合は、既存のタグに寄せてタグが乱立しないようにします。
                    それでは、あなたの書いた文章をいただけますか？
                `
            },
            {
                role: "user",
                content: text
            }
        ]
        return await this.gptRepository.ask(messages)
    }
}