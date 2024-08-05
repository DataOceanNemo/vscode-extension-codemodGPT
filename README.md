<div style="text-align: center;">
  <img src="icon.png" alt="Icon" width="200"/>
</div>

# codemodGPT

This vscode extension learns from existing codemod example, and apply the same to selected files.

## Demo

Using MUI source code as example:
![Demo](demo/demo.gif)

## Features

- **Webview Panel**: Open a webview panel to interact with the extension.
- **Find React Components**: Automatically find all React `.tsx` files that do not have corresponding Storybook stories.
- **Generate Stories**: Use OpenAI's GPT model to generate Storybook stories for your React components.

## Requirements

- **OpenAI API Key**: The extension requires an OpenAI API key to generate stories. You can set this key through the extension's prompts.

## Commands

The extension provides the following commands:

- `codemodGPT: Open`: Opens the codemodGPT webview panel.
- `codemodGPT: Delete OpenAI API Key`: Deletes the stored OpenAI API key from VS Code's secret storage.
- `codemodGPT: Reset OpenAI API Key`: Prompts the user to enter a new OpenAI API key and stores it in VS Code's secret storage.

## How to Use

1. **Open the Webview Panel**: Use the command `codemodGPT: Open` to open the webview panel.
2. **Find Components Without Stories**: The webview will automatically find React components that do not have corresponding Storybook stories.
3. **Generate Stories**: Use the webview interface to generate stories for your components. If the OpenAI API key is not set, you will be prompted to enter it.
4. **Manage API Key**: Use `codemodGPT: Delete OpenAI API Key` to delete the stored API key or `codemodGPT: Reset OpenAI API Key` to update it.

## Release Notes

Please refer to [change log here](https://github.com/DataOceanNemo/vscode-extension-codemodGPT/blob/master/CHANGELOG.md).

## Known Issues

- None reported.

**Enjoy!**
