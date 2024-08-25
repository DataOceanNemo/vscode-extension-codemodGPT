import { exec, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { join, relative } from "path";
import * as vscode from "vscode";
import { ExtensionContext, ExtensionMode, Uri, Webview } from "vscode";
import {
  defaultExcludePatterns,
  defaultMatchPattern,
} from "./webview/utils/constants";

// Get the workspace root path
const workspaceFolder = vscode.workspace.workspaceFolders
  ? path.posix.normalize(vscode.workspace.workspaceFolders[0].uri.fsPath)
  : "";

export const scanWorkspace = async (
  matchPattern = defaultMatchPattern,
  excludePatterns = defaultExcludePatterns
) => {
  const allComponents = await vscode.workspace.findFiles(
    matchPattern,
    `{${excludePatterns.join(",")}}`
  );

  // Calculate relative paths
  const filePaths = allComponents.map((file) =>
    relative(workspaceFolder, (file as vscode.Uri).fsPath).replace(/\\/g, "/")
  );

  return filePaths;
};

export const findExistingCodemodScripts = async () => {
  const allFiles = await vscode.workspace.findFiles("codemod*.js", "**/*/**");

  // Calculate relative paths
  const filePaths = allFiles.map((file) =>
    relative(workspaceFolder, (file as vscode.Uri).fsPath).replace(/\\/g, "/")
  );

  return filePaths;
};

export const loadExistingFile = async (filePath: string) => {
  const uri = Uri.file(join(workspaceFolder, filePath));
  const document = await vscode.workspace.openTextDocument(uri);

  return document.getText();
};

export const getWebviewContent = (
  context: ExtensionContext,
  webview: Webview
) => {
  const jsFile = "webview.js";
  const localServerUrl = "http://localhost:9000";

  let scriptUrl = null;
  let cssUrl = null;

  const isProduction = context.extensionMode === ExtensionMode.Production;
  if (isProduction) {
    scriptUrl = webview
      .asWebviewUri(Uri.file(join(context.extensionPath, "dist", jsFile)))
      .toString();
  } else {
    scriptUrl = `${localServerUrl}/${jsFile}`;
  }

  return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
		${isProduction ? `<link href="${cssUrl}" rel="stylesheet">` : ""}
	</head>
	<body>
		<div id="root"></div>

		<script src="${scriptUrl}"></script>
	</body>
	</html>`;
};

export const getGitDiff = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      reject("No workspace folder found");

      vscode.window.showErrorMessage(
        `Error message: No workspace folder found.`
      );
      return;
    }

    const rootPath = workspaceFolders[0].uri.fsPath;

    exec("git diff --cached", { cwd: rootPath }, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);

        vscode.window.showErrorMessage(`Error message: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

export const stripCodeBlockAnnotations = (text: string) => {
  return text.replace(
    /```(typescript|javascript|tsx|jsx|js)?\n([\s\S]*?)\n```/g,
    "$2"
  );
};

const writeCodemodToWorkspace = (codemod: string) => {
  const codemodFilePath = path.resolve(workspaceFolder, "codemod.js");

  fs.writeFileSync(codemodFilePath, codemod);

  return codemodFilePath;
};

const executeCodemod = (codemodFilePath: string, workspaceFiles: string) => {
  return new Promise((resolve, reject) => {
    const args = ["--workspaceFiles", workspaceFiles];
    const command = spawn("node", [codemodFilePath, ...args]);

    let output = "";
    command.stdout.on("data", (data) => {
      output += data.toString();
    });

    command.stderr.on("data", (data) => {
      output += data.toString();
    });

    command.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}`));
      } else {
        resolve(output);
      }
    });

    command.on("error", (error) => {
      reject(error);
    });
  });
};

export const applyCodemod = async (
  codemod: string,
  fileNodes: string[],
  autoCleanUp: boolean
) => {
  // Save codemod script to a file in the workspace root
  const codemodFilePath = writeCodemodToWorkspace(codemod);

  // Resolve the paths of the workspace files
  const workspaceFiles = fileNodes.map((node) =>
    path.resolve(workspaceFolder, node)
  );

  // Execute the codemod script
  try {
    await executeCodemod(codemodFilePath, JSON.stringify(workspaceFiles));
  } catch (error) {
    throw error;
  } finally {
    // delete the codemod file from the workspace root
    autoCleanUp && fs.unlinkSync(codemodFilePath);
  }
};
