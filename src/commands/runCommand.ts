import * as vscode from 'vscode';
import { exec } from 'child_process';

import { parseBuildErrors } from '../utils/parseErrors';
import { diagnosticCollection, buildOutputChannel } from '../extension';
import { prepareProjectCwd } from '../utils/findProject';

let xsharpRunTerminal: vscode.Terminal | undefined;

export function registerRunCommand(context: vscode.ExtensionContext) {
  const runCommand = vscode.commands.registerCommand('xsharp.runProject', async () => {
    const cwd = await prepareProjectCwd();
    if (!cwd) { return; }

    buildOutputChannel.clear();
    buildOutputChannel.show(true);
    buildOutputChannel.appendLine('Building XSharp project…');

    exec('dotnet build', { cwd, timeout: 60000 }, (error, stdout) => {
      buildOutputChannel.appendLine(stdout);
      diagnosticCollection.clear();
      parseBuildErrors(stdout);

      if (error) {
        buildOutputChannel.appendLine('Build failed.');
        vscode.window.showErrorMessage('Errors compiling XSharp project. Running cancelled');
        return;
      }

      buildOutputChannel.appendLine('Build succeeded. Launching app…');

      if (!xsharpRunTerminal || xsharpRunTerminal.exitStatus !== undefined) {
        xsharpRunTerminal = vscode.window.createTerminal({ name: 'XSharp Application', cwd });
      }
      xsharpRunTerminal.show();
      xsharpRunTerminal.sendText('dotnet run');
    });
  });

  context.subscriptions.push(runCommand);
}
