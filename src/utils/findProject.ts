
import * as vscode from 'vscode';
import * as path from 'path';

export async function findProjectFile(): Promise<vscode.Uri | null> {
  const files = await vscode.workspace.findFiles(
    '**/*.xsproj',
    '**/node_modules/**',
    1
  );

  if (!files || files.length === 0) {
    return null;
  }

  return files[0];
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
