import * as vscode from 'vscode';


import { parseBuildErrors } from './utils/parseErrors';
import { registerBuildCommand } from './commands/buildCommand';
import { registerClearDiagnostics } from './commands/clearDiagnosticsCommand';
import { registerRunCommand } from './commands/runCommand';
import { registerToggleWarnings } from './commands/toggleWarnings';
import { registerSettingsPanelCommand } from './commands/settingsPanelCommand';
import { registerConfigProjectCommand } from './commands/configProjectCommand';
import { registerOpenFolderCommand } from './commands/openFolderCommand';
import { registerLSPClient } from './lsp/lspClient';
import { deactivateLSPClient } from './lsp/lspClient';
import { registerLaunchConfig } from './commands/launchConfig';
import { registerDebugAdapter } from './commands/debugAdapter';

export let diagnosticCollection: vscode.DiagnosticCollection;


export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('xsharp');
  console.log('XSharp extension activated');
  registerLSPClient(context);

  registerLaunchConfig(context);
  registerDebugAdapter(context);

  registerBuildCommand(context);
  registerRunCommand(context);

  registerClearDiagnostics(context);

  registerToggleWarnings(context);

  registerOpenFolderCommand(context);

  registerSettingsPanelCommand(context);

  registerConfigProjectCommand(context);

  if (!vscode.workspace.getConfiguration("launch").get("configurations")) {
    vscode.commands.executeCommand("xsharp.createLaunchConfig");
  }
}

export function deactivate() {
  diagnosticCollection.clear();
  diagnosticCollection.dispose();

  deactivateLSPClient();
}






