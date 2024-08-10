import * as vscode from 'vscode';
import { customMessageHandlers } from './messaging';
import { getWebviewContent } from './utils';
import ChatGPTClient from './webview/utils/openAI';

export function activate(context: vscode.ExtensionContext) {
  let openWebviewDisposable = vscode.commands.registerCommand('vscode-codemodGPT.openWebview', async () => {
    const panel = vscode.window.createWebviewPanel(
      'react-webview',
      'codemodGPT',
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        retainContextWhenHidden: true
      }
    );

    // Check if OpenAI API key is set
    let openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      // Try to get it from VS Code's credential storage
      openaiApiKey = await context.secrets.get('OPENAI_API_KEY');
    }

    const client = new ChatGPTClient(openaiApiKey, context.globalState.get('selectedModel'), context.globalState.get('prompt_system'));

    // define the message handlers
    panel.webview.onDidReceiveMessage(customMessageHandlers(panel, context, client), undefined, context.subscriptions);

    panel.webview.html = getWebviewContent(context, panel.webview);
    panel.iconPath = vscode.Uri.joinPath(context.extensionUri, "icon.png");
  });

  // Command to delete the API key from the secret storage
  let deleteApiKeyDisposable = vscode.commands.registerCommand('vscode-codemodGPT.deleteApiKey', async () => {
    const secretKey = 'OPENAI_API_KEY';
    try {
      await context.secrets.delete(secretKey);
      vscode.window.showInformationMessage(`Secret ${secretKey} has been deleted successfully.`);
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to delete secret ${secretKey}: ${error instanceof Error ? error.message :
        'Unknown error'
        }`);
    }
  });


  // Command to reset the API key in the secret storage
  let resetApiKeyDisposable = vscode.commands.registerCommand('vscode-codemodGPT.resetApiKey', async () => {
    const secretKey = 'OPENAI_API_KEY';
    try {
      const inputApiKey = await vscode.window.showInputBox({
        prompt: 'Enter your new OpenAI API Key',
        ignoreFocusOut: true,
        placeHolder: 'sk-...',
        password: true,
      });

      if (inputApiKey) {
        await context.secrets.store(secretKey, inputApiKey);
        vscode.window.showInformationMessage(`Secret ${secretKey} has been reset successfully.`);
      } else {
        vscode.window.showErrorMessage('OpenAI API Key reset canceled.');
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to reset secret ${secretKey}: ${error instanceof Error ? error.message :
        'Unknown error'
        }`);
    }
  });

  context.subscriptions.push(openWebviewDisposable, deleteApiKeyDisposable, resetApiKeyDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
