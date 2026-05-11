import * as vscode from 'vscode';

export function registerOpenFolderCommand(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand(
        'xsharp.openFolderOfActiveFile',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showErrorMessage('No active file.');
                return;
            }

            await vscode.commands.executeCommand('revealFileInOS', editor.document.uri);
        }
    );

    context.subscriptions.push(disposable);
}
