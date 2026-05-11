
import * as vscode from 'vscode';

import { getSettingsPanelHtml } from '../panels/settingsPanel';

function getNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function registerSettingsPanelCommand(context: vscode.ExtensionContext) {

    const settingsPanelCommand = vscode.commands.registerCommand('xsharp.settingsPanel', () => {
        const nonce = getNonce();
        const panel = vscode.window.createWebviewPanel(
            'xsharpSettings',
            'XSharp Tools Settings',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const config = vscode.workspace.getConfiguration('xsharp-tools');

        panel.webview.html = getSettingsPanelHtml(config, nonce);

        panel.webview.onDidReceiveMessage(
            async message => {
                await config.update(message.setting, message.value, vscode.ConfigurationTarget.Workspace);
                vscode.window.showInformationMessage(`Setting "${message.setting}" updated : ${message.value ? 'ON' : 'OFF'}`);
            },
            undefined,
            context.subscriptions
        );
    });



    context.subscriptions.push(settingsPanelCommand);


}

