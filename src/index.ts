import OpenAI from 'openai';

async function main() {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
    const completion = await openai.chat.completions.create({
        messages: [{ role: "system", content: "You are a helpful assistant." }],
        model: "gpt-4",
    });
    console.log(completion.choices[0].message.content);
}

main();