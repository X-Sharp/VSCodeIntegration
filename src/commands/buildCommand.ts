import * as vscode from 'vscode';
import { exec } from 'child_process';

import { parseBuildErrors } from '../utils/parseErrors';
import { diagnosticCollection, buildOutputChannel } from '../extension';
import { prepareProjectCwd } from '../utils/findProject';

export function registerBuildCommand(context: vscode.ExtensionContext) {
  const buildCommand = vscode.commands.registerCommand('xsharp.buildProject', async () => {
    const cwd = await prepareProjectCwd();
    if (!cwd) return;

    buildOutputChannel.clear();
    buildOutputChannel.show(true);
    buildOutputChannel.appendLine('Building XSharp project…');

    exec('dotnet build', { cwd, timeout: 60000 }, (error, stdout) => {
      buildOutputChannel.appendLine(stdout);
      diagnosticCollection.clear();
      parseBuildErrors(stdout);

      if (error) {
        buildOutputChannel.appendLine('Build failed.');
        vscode.window.showErrorMessage('Errors compiling XSharp project.');
        return;
      }

      buildOutputChannel.appendLine('Build succeeded.');
      vscode.window.showInformationMessage('Compiling XSharp Project successfull.');
    });
  });

  context.subscriptions.push(buildCommand);
}
