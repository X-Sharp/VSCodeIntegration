import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';

import { buildOutputChannel } from '../extension';
import { listXSharpProjectTemplates } from '../utils/dotnetTemplates';

export function registerCreateProjectCommand(context: vscode.ExtensionContext) {
    const createProjectCommand = vscode.commands.registerCommand(
        'xsharp.createProject',
        async (targetFolder?: vscode.Uri) => {
            const templates = await listXSharpProjectTemplates();
            if (templates.length === 0) {
                return;
            }

            const picked = await vscode.window.showQuickPick(
                templates.map(t => ({
                    label: t.name,
                    description: t.shortName,
                    detail: t.tags,
                    template: t,
                })),
                { placeHolder: 'Select an XSharp project template' }
            );
            if (!picked) {
                return;
            }

            const projectName = await vscode.window.showInputBox({
                prompt: 'Project name',
                placeHolder: 'MyProject',
                validateInput: value => value.trim() ? undefined : 'Project name cannot be empty.',
            });
            if (!projectName) {
                return;
            }

            const folder = targetFolder ?? (await vscode.window.showOpenDialog({
                canSelectFolders: true,
                canSelectFiles: false,
                canSelectMany: false,
                openLabel: 'Select Destination Folder',
            }))?.[0];
            if (!folder) {
                return;
            }

            const outputPath = path.join(folder.fsPath, projectName);

            buildOutputChannel.clear();
            buildOutputChannel.show(true);
            buildOutputChannel.appendLine(`Creating XSharp project '${projectName}' from template '${picked.template.shortName}'…`);

            await vscode.window.withProgress(
                { location: vscode.ProgressLocation.Notification, title: `Creating ${projectName}…` },
                () => new Promise<void>(resolve => {
                    exec(
                        `dotnet new ${picked.template.shortName} -n "${projectName}" -o "${outputPath}"`,
                        { env: { ...process.env, DOTNET_CLI_UI_LANGUAGE: 'en' }, timeout: 60000 },
                        async (error, stdout) => {
                            buildOutputChannel.appendLine(stdout);

                            if (error) {
                                buildOutputChannel.appendLine('Project creation failed.');
                                vscode.window.showErrorMessage('Failed to create XSharp project.');
                                resolve();
                                return;
                            }

                            buildOutputChannel.appendLine('Project created successfully.');
                            await context.globalState.update('xsharp.pendingConfigureProject', outputPath);
                            await vscode.commands.executeCommand(
                                'vscode.openFolder',
                                vscode.Uri.file(outputPath),
                                { forceNewWindow: false }
                            );
                            resolve();
                        }
                    );
                })
            );
        }
    );

    context.subscriptions.push(createProjectCommand);
}
