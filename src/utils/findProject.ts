
import * as vscode from 'vscode';
import * as path from 'path';

export async function findProjectFile(): Promise<vscode.Uri | null> {
  const files = await vscode.workspace.findFiles('**/*.xsproj', '**/node_modules/**');

  if (!files || files.length === 0) {
    vscode.window.showErrorMessage('No .xsproj file found in workspace.');
    return null;
  }

  if (files.length === 1) return files[0];

  const items = files.map(f => ({
    label: path.basename(f.fsPath),
    description: vscode.workspace.asRelativePath(f),
    uri: f,
  }));

  const picked = await vscode.window.showQuickPick(items, {
    placeHolder: 'Select XSharp project',
  });

  return picked?.uri ?? null;
}

export async function prepareProjectCwd(): Promise<string | null> {
  if (!vscode.workspace.workspaceFolders) {
    vscode.window.showErrorMessage('No Folder open.');
    return null;
  }
  await vscode.workspace.saveAll();
  const projectFile = await findProjectFile();
  if (!projectFile) return null;
  return path.dirname(projectFile.fsPath);
}
