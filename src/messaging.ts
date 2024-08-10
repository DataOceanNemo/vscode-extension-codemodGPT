import { MessageHandlerData } from '@estruyf/vscode';
import * as vscode from 'vscode';
import { applyCodemod, getGitDiff, scanWorkspace, stripCodeBlockAnnotations } from './utils';
import { defaultGeneratePrompt, MessageCommands } from './webview/utils/constants';
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
            matchPattern: context.globalState.get('matchPattern'),
            excludePatterns: context.globalState.get('excludePatterns'),
            promptSystem: context.globalState.get('promptSystem'),
            promptGenerate: context.globalState.get('promptGenerate'),
          })
        } as MessageHandlerData<string>);
        break;

      case MessageCommands.SCAN:
        const filePaths = await scanWorkspace(context.globalState.get('matchPattern'), (context.globalState.get('excludePatterns') as string).split('\n'));

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

        if (gifDiff) {
          const answer = await client.ask(`Please sum up what did you learn in bulletin points and less than 100 words.
          Git diff result:\n${gifDiff}`);

          panel.webview.postMessage({
            command,
            requestId,
            payload: answer
          } as MessageHandlerData<string>);

          vscode.window.showInformationMessage('Learning completed!');
        } else {
          vscode.window.showWarningMessage('No staged files found. Please stage your changes and try again.');

          panel.webview.postMessage({
            command,
            requestId,
            payload: ''
          } as MessageHandlerData<string>);
        }

        break;

      case MessageCommands.GENERATE:
        vscode.window.showInformationMessage('Generating codemod script...');

        const codemod = await client.ask(defaultGeneratePrompt);

        panel.webview.postMessage({
          command,
          requestId,
          payload: stripCodeBlockAnnotations(codemod || 'No codemod script generated.')
        } as MessageHandlerData<string>);

        codemod && context.globalState.update('codemodScript', stripCodeBlockAnnotations(codemod));

        vscode.window.showInformationMessage('Generation completed!');

        break;

      case MessageCommands.STORE_DATA:
        // Store data
        payload.selectedModel && context.globalState.update('selectedModel', payload.selectedModel);
        payload.matchPattern && context.globalState.update('matchPattern', payload.matchPattern);
        payload.excludePatterns && context.globalState.update('excludePatterns', payload.excludePatterns);
        payload.promptSystem && context.globalState.update('promptSystem', payload.promptSystem);
        payload.promptGenerate && context.globalState.update('promptGenerate', payload.promptGenerate);
        payload.codemodScript && context.globalState.update('codemodScript', payload.codemodScript)

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