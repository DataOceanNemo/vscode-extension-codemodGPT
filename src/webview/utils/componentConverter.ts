import OpenAI from "openai";


export type ConvertType = {
  component: string;
  openaiApiKey: string;
  selectedModel: string;
  template: string;
};

function stripCodeBlockAnnotations(text: string) {
  return text.replace(/```(typescript|javascript|tsx|jsx)?\n([\s\S]*?)\n```/g, '$2');
}

export async function ComponentConverter({ component, openaiApiKey, selectedModel, template }: ConvertType) {
  const prompt = `Write a Storybook component from a React component, without any comments added.\nThis is the template I want you to use to create the storybook component, keep the provided format, add component variants if possible:\n${template}\n`;

  const openai = new OpenAI({
    apiKey: openaiApiKey,
  });

  console.log(`Using chatGPT model: `, selectedModel);

  const response = await openai.chat.completions.create({
    model: selectedModel,
    messages: [
      {
        role: "system",
        content: prompt,
      },
      {
        role: "user",
        content: component,
      },
    ],
    temperature: 0.5,
    top_p: 1.0,
    frequency_penalty: 0.5,
    presence_penalty: 0.1,
    stream: false,
  });

  return stripCodeBlockAnnotations(response.choices[0].message.content || '');
}
 