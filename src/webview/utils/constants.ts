
export const models = [
  { label: "GPT-3.5-turbo (default)", value: "gpt-3.5-turbo" },
  { label: "GPT-4o", value: "gpt-4o" },
  { label: "GPT-4o-mini", value: "gpt-4o-mini" },
  { label: "GPT-4", value: "gpt-4" },
  { label: "GPT-4-turbo", value: "gpt-4-turbo" },
];

export const defaultMatchPattern = "**/*.{tsx,ts}";

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

export const defaultGeneratePrompt = `Can you write a codemod script that applies the same changes to other files?

The codemod should have conditions to skip files/folders that already have the change applied.
The codemod should derive a pattern from the git diff output, eg. try to detect file renames, relationship between string values and filenames, etc.
Try your best to not use hardcoded strings, eg. file names, folder names, replace strings. In most case, these values can be derived from applicable files/folders/code content.
Try to throw any errors caught in the codemod script.
The codemod should skip the files in git diff, and other files/folders that already match the codemod output pattern. 
Eg. if it's creating a new file type *.stories.tsx, skip when there is already a *.stories.tsx file in the folder.

The codemod should have 2 main functions: 
1. scan(): scan the workspaceFiles(array of file paths passed in as argument) and find the applicable files/folders
2. apply(): apply the codemod changes to the output files/folders from scan()

Please try to use regex to generalize the pattern.
Please make sure the code is ready to run in the terminal: "node codemod.js --workspaceFiles workspaceFiles".
Can you only response in js code format? no need to add any other text above or below the code.`

export enum MessageCommands {
  GET_GLOBAL_STATE = 'GET_GLOBAL_STATE',
  SCAN = 'SCAN',
  STORE_DATA = 'STORE_DATA',
  APPLY_REQUEST = 'APPLY_REQUEST',
  APPLY_RESULT = 'APPLY_RESULT',
  LEARN = 'LEARN',
  GENERATE = 'GENERATE',
}

