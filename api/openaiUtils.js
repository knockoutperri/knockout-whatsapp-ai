// api/openaiUtils.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getChatCompletion(messages) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages,
    temperature: 0.4,
  });

  return completion.choices[0]?.message?.content?.trim();
}
