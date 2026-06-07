import * as vscode from 'vscode';


import { registerBuildCommand } from './commands/buildCommand';
import { registerClearDiagnostics } from './commands/clearDiagnosticsCommand';
import { registerRunCommand } from './commands/runCommand';
import { registerToggleWarnings } from './commands/toggleWarnings';
import { registerSettingsPanelCommand } from './commands/settingsPanelCommand';
import { registerConfigProjectCommand } from './commands/configProjectCommand';
import { registerCreateProjectCommand } from './commands/createProjectCommand';
import { registerOpenFolderCommand } from './commands/openFolderCommand';
import { registerLSPClient } from './lsp/lspClient';
import { deactivateLSPClient } from './lsp/lspClient';
import { registerLaunchConfig } from './commands/launchConfig';
import { registerDebugAdapter } from './commands/debugAdapter';

export let diagnosticCollection: vscode.DiagnosticCollection;
export let buildOutputChannel: vscode.OutputChannel;

export function activate(context: vscode.ExtensionContext) {
  diagnosticCollection = vscode.languages.createDiagnosticCollection('xsharp');
  buildOutputChannel = vscode.window.createOutputChannel('XSharp Build');
  context.subscriptions.push(buildOutputChannel);
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

  registerCreateProjectCommand(context);

  if (!vscode.workspace.getConfiguration("launch").get("configurations")) {
    vscode.commands.executeCommand("xsharp.createLaunchConfig");
  }

  // If we just scaffolded a new project and reloaded into its folder, open the
  // configurator once so the user can review/adjust settings right away.
  const pendingConfigureProject = context.globalState.get<string>('xsharp.pendingConfigureProject');
  if (pendingConfigureProject && vscode.workspace.workspaceFolders?.some(f => f.uri.fsPath === pendingConfigureProject)) {
    context.globalState.update('xsharp.pendingConfigureProject', undefined);
    vscode.commands.executeCommand('xsharp.configureProject');
  }
}

export function deactivate() {
  diagnosticCollection.clear();
  diagnosticCollection.dispose();
  deactivateLSPClient();
}






