<div style="text-align: center;">
  <img src="icon.png" alt="Icon" width="200"/>
</div>

# codemodGPT

This vscode extension learns from existing codemod example, and apply the same to selected files.

## Demo

coming soon...

## Features

- **Webview Panel**: Open a webview panel to interact with the extension.
- **Learn from git diff**: Automatically learn codemod pattern from `git diff`.
- **Apply codemod**: Apply codemod pattern to selected files.

## Requirements

- **OpenAI API Key**: The extension requires an OpenAI API key to work. You can set this key through the extension's prompts.

## Commands

The extension provides the following commands:

- `codemodGPT: Open`: Opens the codemodGPT webview panel.
- `codemodGPT: Delete OpenAI API Key`: Deletes the stored OpenAI API key from VS Code's secret storage.
- `codemodGPT: Reset OpenAI API Key`: Prompts the user to enter a new OpenAI API key and stores it in VS Code's secret storage.

## How to Use

1. **Open the Webview Panel**: Use the command `codemodGPT: Open` to open the webview panel.
2. **Learn from git diff**: Click `Learn` button to ask chatGPT to automatically learn codemod pattern from `git diff`.
3. **Apply codemod**: Use the webview interface to select files and apply codemod.
4. **Manage API Key**: Use `codemodGPT: Delete OpenAI API Key` to delete the stored API key or `codemodGPT: Reset OpenAI API Key` to update it.

## Release Notes

Please refer to [change log here](https://github.com/DataOceanNemo/vscode-extension-codemodGPT/blob/master/CHANGELOG.md).

## Known Issues

- None reported.

**Enjoy!**
