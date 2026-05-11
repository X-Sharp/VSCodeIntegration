import * as vscode from 'vscode';
import { exec } from 'child_process';

import { parseBuildErrors } from '../utils/parseErrors';
import { diagnosticCollection } from '../extension';
import { prepareProjectCwd } from '../utils/findProject';

export function registerBuildCommand(context: vscode.ExtensionContext) {
  const buildCommand = vscode.commands.registerCommand('xsharp.buildProject', async () => {
    const cwd = await prepareProjectCwd();
    if (!cwd) return;

    vscode.window.showInformationMessage('Compiling XSharp project…');
    console.log('→ dotnet build started');

    exec('dotnet build', { cwd, timeout: 60000 }, (error, stdout) => {
      diagnosticCollection.clear();
      parseBuildErrors(stdout);

      if (error) {
        vscode.window.showErrorMessage('Errors compiling XSharp project.');
        return;
      }

      vscode.window.showInformationMessage('Compiling XSharp Project successfull.');
      console.log(stdout);
    });
  });

  context.subscriptions.push(buildCommand);
}
