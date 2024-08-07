import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import { defaultPrompt } from "./constants";

class ChatGPTClient {
  openaiApiKey?: string;
  model: string;
  #contextArray: ChatCompletionMessageParam[];

  constructor(openaiApiKey?: string, model = "gpt-3.5-turbo", prompt = defaultPrompt) {
    this.openaiApiKey = openaiApiKey;
    this.model = model;
    this.#contextArray = [{
      role: "system",
      content: prompt,
    }];
  }

  async ask(question: string) {
    const openai = new OpenAI({
      apiKey: this.openaiApiKey,
    });

    // Add the user's question to the context array
    this.#contextArray.push({
      role: "user",
      content: question,
    });

    const response = await openai.chat.completions.create({
      model: this.model,
      messages: this.#contextArray,
      temperature: 0.5,
      top_p: 1.0,
      frequency_penalty: 0.5,
      presence_penalty: 0.1,
      stream: false,
    });

    const assistantResponse = response.choices[0].message.content;
    if (assistantResponse) {
      this.#contextArray.push({
        role: "assistant",
        content: assistantResponse,
      });
    }

    return assistantResponse;
  }
}

export default ChatGPTClient;
