
export const models = [
  { label: "GPT-3.5-turbo (default)", value: "gpt-3.5-turbo" },
  { label: "GPT-4o", value: "gpt-4o" },
  { label: "GPT-4o-mini", value: "gpt-4o-mini" },
  { label: "GPT-4", value: "gpt-4" },
  { label: "GPT-4-turbo", value: "gpt-4-turbo" },
];

export const defaultExcludePatterns = [
  "**/node_modules/**",
  "**/dist/**",
  "**/build/**",
  "**/coverage/**",
  "**/__tests__/**",
  "**/__mocks__/**",
  "**/__snapshots__/**",
  "**/test/**",
  "**/tests/**",
  "**/spec/**",
  "**/specs/**",
  "**/setupTests.tsx",
  "**/*.spec.tsx",
  "**/*.test.tsx",
  "**/*.docs.tsx",
  "**/*.e2e.tsx",
  "**/*.helper.tsx",
];

export const defaultPrompt = `You are a software engineer who will design codemod tasks using node js. 
You will be given a 'git diff' output and you will analyze it and write a concise summary of what you learned from the diff. 
You will derive a pattern from the git diff output, eg. try to detect file renames, relationship between string values and filenames, etc.
The summary should be in bullet points. Please keep it short and precise.`;

export enum MessageCommands {
  GET_GLOBAL_STATE = 'GET_GLOBAL_STATE',
  SCAN = 'SCAN',
  STORE_DATA = 'STORE_DATA',
  APPLY_REQUEST = 'APPLY_REQUEST',
  APPLY_RESULT = 'APPLY_RESULT',
  LEARN = 'LEARN',
  GENERATE = 'GENERATE',
}

