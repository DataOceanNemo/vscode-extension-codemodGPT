import { MessageHandlerData } from '@estruyf/vscode';
import * as vscode from 'vscode';
import { applyCodemod, getGitDiff, scanWorkspace, stripCodeBlockAnnotations } from './utils';
import { MessageCommands } from './webview/utils/constants';
import ChatGPTClient from './webview/utils/openAI';


export interface IMessage {
  command: MessageCommands;
  requestId: string;
  payload: any;
}

export const customMessageHandlers = (panel: vscode.WebviewPanel, context: vscode.ExtensionContext, client: ChatGPTClient) =>
  async (message: IMessage) => {
    if (!client.openaiApiKey) {
      // Prompt user to input API key
      const inputApiKey = await vscode.window.showInputBox({
        prompt: 'Enter your OpenAI API Key',
        ignoreFocusOut: true,
        placeHolder: 'sk-...',
        password: true,
      });

      if (inputApiKey) {
        client.openaiApiKey = inputApiKey;
        // store the API key in VS Code's credential storage
        await context.secrets.store('OPENAI_API_KEY', inputApiKey);
      } else {
        vscode.window.showErrorMessage('OpenAI API Key is required for this step.');
        // Send a response back to the webview
        panel.webview.postMessage({ command: MessageCommands.LEARN, result: {} });

        return;
      }
    }

    const { command, requestId, payload } = message;

    switch (command) {
      case MessageCommands.GET_GLOBAL_STATE:
        panel.webview.postMessage({
          command,
          requestId,
          payload: JSON.stringify({
            selectedModel: context.globalState.get('selectedModel'),
            excludePatterns: context.globalState.get('excludePatterns'),
            prompt: context.globalState.get('prompt'),
          })
        } as MessageHandlerData<string>);
        break;

      case MessageCommands.SCAN:
        const filePaths = await scanWorkspace(payload.excludePatterns.split('\n'));

        // Send a response back to the webview
        panel.webview.postMessage({
          command,
          requestId, // The requestId is used to identify the response
          payload: JSON.stringify(filePaths)
        } as MessageHandlerData<string>);
        break;

      case MessageCommands.LEARN:
        vscode.window.showInformationMessage('Learning from git diff output...');

        const gifDiff = await getGitDiff();

        const answer = await client.ask(`Please sum up what did you learn in bulletin points and less than 100 words.
          Git diff result:\n${gifDiff}`);

        panel.webview.postMessage({
          command,
          requestId,
          payload: answer
        } as MessageHandlerData<string>);

        vscode.window.showInformationMessage('Learning completed!');

        break;

      case MessageCommands.GENERATE:
        vscode.window.showInformationMessage('Generating codemod script...');

        const codemod = await client.ask(`Can you write a codemod script that applies the same changes to other files?
          The codemod should have conditions to skip files/folders that already have the change applied.
          The codemod should derive a pattern from the git diff output, eg. try to detect file renames, relationship between string values and filenames, etc.
          Try your best to not use hardcoded strings, eg. file names, folder names, replace strings. In most case, these values can be derived from applicable files/folders/code content.
          Try to use regex to generalize the pattern.
          Try to throw any errors caught in the codemod script.
          The codemod should skip the files in git diff, and other files/folders that already match the codemod output pattern. 
          Eg. if it's creating a new file type *.stories.tsx, skip when there is already a *.stories.tsx file in the folder.
          The codemod should have 2 main functions: 
          1. scan(): scan the workspaceFiles(array of file paths passed in as argument) and find the applicable files/folders
          2. apply(): apply the codemod changes to the output files/folders from scan()
          Please make sure the code is ready to run in the terminal: "node codemod.js --workspaceFiles workspaceFiles".
          Can you only response in js code format? no need to add any other text above or below the code.`);

        panel.webview.postMessage({
          command,
          requestId,
          payload: codemod
        } as MessageHandlerData<string>);

        codemod && context.globalState.update('codemodScript', stripCodeBlockAnnotations(codemod));

        vscode.window.showInformationMessage('Generation completed!');

        break;

      case MessageCommands.STORE_DATA:
        // Store data
        payload.selectedModel && context.globalState.update('selectedModel', payload.selectedModel);
        payload.excludePatterns && context.globalState.update('excludePatterns', payload.excludePatterns);
        payload.prompt && context.globalState.update('prompt', payload.prompt);

        if (payload.selectedModel) {
          client.model = payload.selectedModel;
        }

        break;

      case MessageCommands.APPLY_REQUEST:
        vscode.window.showInformationMessage('Applying codemod to selected files...');

        const codemodScript = context.globalState.get('codemodScript') as string;

        if (codemodScript) {
          try {
            await applyCodemod(codemodScript, JSON.parse(payload.msg));
          } catch (error) {
            vscode.window.showErrorMessage(`Applying error: ${error instanceof Error ? error.message :
              'Unknown error'}`);
          } finally {
            panel.webview.postMessage({ command: MessageCommands.APPLY_RESULT, result: {} });
          }

          vscode.window.showInformationMessage('Apply completed!');
        } else {
          vscode.window.showErrorMessage('Error: codemod script not found.');
        }

        break;

      default:
        break;
    }
  }