import OpenAI from "openai";


export type ConvertType = {
  openaiApiKey: string;
  selectedModel: string;
  prompt: string;
  question: string;
};


export const askChatGPT = async ({ prompt, openaiApiKey, selectedModel, question }: ConvertType) => {
  const openai = new OpenAI({
    apiKey: openaiApiKey,
  });

  const response = await openai.chat.completions.create({
    model: selectedModel,
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: question,
      },
    ],
    temperature: 0.5,
    top_p: 1.0,
    frequency_penalty: 0.5,
    presence_penalty: 0.1,
    stream: false,
  });

  return response.choices[0].message.content;
}


type WhatDidYouLearnType = {
  question: string;
  openaiApiKey: string;
  selectedModel?: string;
};

export const whatDidYouLearn = async ({ question, openaiApiKey, selectedModel = 'gpt-3.5-turbo' }: WhatDidYouLearnType) => {
  const prompt = `You are a software engineer who will design codemod tasks. 
  You will be given a 'git diff' output and you will analyze it and write a concise summary of what you learned from the diff. 
  The summary should be in bullet points. Please keep it short and precise. 
  Note: please try to detect file renames, when a file deleted has the same content as the file created.`;

  return askChatGPT({ prompt, openaiApiKey, selectedModel, question: `Git diff result:\n${question}` });
}