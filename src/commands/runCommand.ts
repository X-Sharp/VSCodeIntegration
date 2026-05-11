import * as vscode from 'vscode';
import { exec } from 'child_process';

import { parseBuildErrors } from '../utils/parseErrors';
import { diagnosticCollection } from '../extension';
import { prepareProjectCwd } from '../utils/findProject';

let xsharpRunTerminal: vscode.Terminal | undefined;

export function registerRunCommand(context: vscode.ExtensionContext) {
  const runCommand = vscode.commands.registerCommand('xsharp.runProject', async () => {
    const cwd = await prepareProjectCwd();
    if (!cwd) return;

    vscode.window.showInformationMessage('Compiling XSharp project…');

    exec('dotnet build', { cwd, timeout: 60000 }, (error, stdout) => {
      diagnosticCollection.clear();
      parseBuildErrors(stdout);

      if (error) {
        vscode.window.showErrorMessage('Errors compiling XSharp project. Running cancelled');
        return;
      }

      vscode.window.showInformationMessage('Compiling XSharp Project successfull. Running app…');

      if (!xsharpRunTerminal || xsharpRunTerminal.exitStatus !== undefined) {
        xsharpRunTerminal = vscode.window.createTerminal({ name: 'XSharp Application', cwd });
      }
      xsharpRunTerminal.show();
      xsharpRunTerminal.sendText('dotnet run');
    });
  });

  context.subscriptions.push(runCommand);
}
