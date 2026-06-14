import * as vscode from 'vscode';

interface LspRange {
    start: { line: number; character: number };
    end:   { line: number; character: number };
}

interface LspLocation {
    uri:   string;
    range: LspRange;
}

export function registerCodeLensCommands(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
        vscode.commands.registerCommand(
            'xsharp.codeLens.showAuthors',
            // Arguments from the server: [declarationUri, declarationPosition]
            async (declUriStr: string, declPos: { line: number; character: number }) => {
                const declUri = vscode.Uri.parse(declUriStr);
                const pos     = new vscode.Position(declPos.line, declPos.character);

                // Open the file and position the cursor on the declaration line.
                const doc    = await vscode.workspace.openTextDocument(declUri);
                const editor = await vscode.window.showTextDocument(doc, { preserveFocus: false });
                editor.selection = new vscode.Selection(pos, pos);
                editor.revealRange(new vscode.Range(pos, pos));

                // Show GitLens blame view if available; degrade silently if not installed.
                try {
                    await vscode.commands.executeCommand('gitlens.toggleFileBlame');
                } catch {
                    // GitLens not installed — cursor position is already useful.
                }
            }
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'xsharp.codeLens.showHistory',
            // Arguments from the server: [declarationUri, declarationPosition]
            async (declUriStr: string, declPos: { line: number; character: number }) => {
                const declUri = vscode.Uri.parse(declUriStr);
                const pos     = new vscode.Position(declPos.line, declPos.character);

                // Open the file and position the cursor on the declaration line.
                const doc    = await vscode.workspace.openTextDocument(declUri);
                const editor = await vscode.window.showTextDocument(doc, { preserveFocus: false });
                editor.selection = new vscode.Selection(pos, pos);
                editor.revealRange(new vscode.Range(pos, pos));

                // Try GitLens line-history view first; fall back to a terminal git log.
                try {
                    await vscode.commands.executeCommand('gitlens.showLineHistoryView');
                } catch {
                    // GitLens not installed — open terminal with an equivalent git log command.
                    const filePath = declUri.fsPath.replace(/\\/g, '/');
                    const gitLine  = declPos.line + 1; // git log -L uses 1-based lines
                    const terminal = vscode.window.createTerminal('XSharp Git History');
                    terminal.show(true);
                    terminal.sendText(
                        `git log --follow --oneline -L ${gitLine},${gitLine}:"${filePath}"`
                    );
                }
            }
        )
    );

    context.subscriptions.push(
        vscode.commands.registerCommand(
            'xsharp.codeLens.showReferences',
            // Arguments from the server: [declarationUri, declarationPosition, locations[]]
            async (declUriStr: string, declPos: { line: number; character: number }, lspLocations: LspLocation[]) => {
                const declUri = vscode.Uri.parse(declUriStr);
                const pos     = new vscode.Position(declPos.line, declPos.character);

                // Ensure the document is open and cursor is at the declaration.
                const doc    = await vscode.workspace.openTextDocument(declUri);
                const editor = await vscode.window.showTextDocument(doc, { preserveFocus: false });
                editor.selection = new vscode.Selection(pos, pos);

                // Convert the server-supplied location list to VS Code Location objects.
                // These are the same locations used to compute the CodeLens count,
                // so the panel always shows exactly what the count says.
                const refs = (lspLocations ?? []).map(l => new vscode.Location(
                    vscode.Uri.parse(l.uri),
                    new vscode.Range(
                        l.range.start.line, l.range.start.character,
                        l.range.end.line,   l.range.end.character,
                    )
                ));

                await vscode.commands.executeCommand(
                    'editor.action.showReferences', declUri, pos, refs
                );
            }
        )
    );
}
