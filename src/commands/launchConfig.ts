// src/commands/runCommand.ts
import * as vscode from 'vscode';
import { exec } from 'child_process';

import { parseBuildErrors } from '../utils/parseErrors';
import { diagnosticCollection } from '../extension';

export function registerLaunchConfig(context: vscode.ExtensionContext) {
    // Command : buildProject

    vscode.commands.registerCommand("xsharp.createLaunchConfig", async () => {
        const ws = vscode.workspace.workspaceFolders?.[0];
        if (!ws) { return; }

        const launchJson = vscode.Uri.joinPath(ws.uri, ".vscode", "launch.json");

        const exists = await vscode.workspace.fs.stat(launchJson).then(() => true, () => false);
        if (exists) { return; }

        const content = JSON.stringify({
            version: "0.2.0",
            configurations: [
                {
                    type: "xsharp",
                    request: "launch",
                    name: "Run XSharp Program"
                }
            ]
        }, null, 4);

        await vscode.workspace.fs.writeFile(launchJson, Buffer.from(content, "utf8"));
    });

}