import * as vscode from 'vscode';
import { getSettingsPanelHtml } from '../panels/settingsPanel';

function getNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function registerSettingsPanelCommand(context: vscode.ExtensionContext) {

    const cmd = vscode.commands.registerCommand('xsharp.settingsPanel', () => {
        const panel = vscode.window.createWebviewPanel(
            'xsharpSettings',
            'XSharp Settings',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        function refreshHtml() {
            const freshTools = vscode.workspace.getConfiguration('xsharp-tools');
            const freshLsp   = vscode.workspace.getConfiguration('xsharp');
            panel.webview.html = getSettingsPanelHtml({ tools: freshTools, lsp: freshLsp }, getNonce());
        }

        refreshHtml();

        panel.onDidChangeViewState(e => {
            if (e.webviewPanel.visible) { refreshHtml(); }
        }, undefined, context.subscriptions);

        panel.webview.onDidReceiveMessage(
            async (message: { ns: string; setting: string; type: string; value: unknown }) => {
                const cfg    = message.ns === 'tools'
                    ? vscode.workspace.getConfiguration('xsharp-tools')
                    : vscode.workspace.getConfiguration('xsharp');
                const target = vscode.ConfigurationTarget.Workspace;

                await cfg.update(message.setting, message.value, target);

                const display = message.type === 'boolean'
                    ? (message.value ? 'ON' : 'OFF')
                    : String(message.value);
                vscode.window.showInformationMessage(
                    `XSharp: "${message.setting}" → ${display}`);
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(cmd);
}
