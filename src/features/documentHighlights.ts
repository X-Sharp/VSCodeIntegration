import * as vscode from 'vscode';
import { DocumentHighlightRequest } from 'vscode-languageclient/node';
import { getClient } from '../lsp/lspClient';

// Keyword pair highlights (DocumentHighlightKind.Write = 3) use a strong background.
// Identifier occurrence highlights (DocumentHighlightKind.Text = 1) use the standard background.
let _pairDecorationType: vscode.TextEditorDecorationType | undefined;
let _occDecorationType:  vscode.TextEditorDecorationType | undefined;

let _debounceTimer: ReturnType<typeof setTimeout> | undefined;
let _cancellationSource: vscode.CancellationTokenSource | undefined;

export function registerDocumentHighlights(context: vscode.ExtensionContext): void {
    _pairDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor('editor.wordHighlightStrongBackground'),
        borderRadius: '3px',
    });
    _occDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: new vscode.ThemeColor('editor.wordHighlightBackground'),
        borderRadius: '3px',
    });

    context.subscriptions.push(
        { dispose: () => { _pairDecorationType?.dispose(); _pairDecorationType = undefined; } },
        { dispose: () => { _occDecorationType?.dispose();  _occDecorationType  = undefined; } }
    );

    // Re-apply highlights on every cursor/selection change, with a short debounce.
    context.subscriptions.push(
        vscode.window.onDidChangeTextEditorSelection(event => {
            scheduleUpdate(event.textEditor);
        })
    );

    // Clear highlights when the active editor changes (avoids stale decorations).
    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(() => clearAllHighlights())
    );
}

function scheduleUpdate(editor: vscode.TextEditor): void {
    if (_debounceTimer !== undefined) {
        clearTimeout(_debounceTimer);
        _debounceTimer = undefined;
    }
    _debounceTimer = setTimeout(() => {
        _debounceTimer = undefined;
        applyHighlights(editor).catch(() => clearHighlights(editor));
    }, 100);  // 100ms — much shorter than VS Code's built-in 300ms debounce
}

async function applyHighlights(editor: vscode.TextEditor): Promise<void> {
    if (!_pairDecorationType || !_occDecorationType) {
        return;
    }
    if (editor.document.languageId !== 'xsharp') {
        return;
    }

    // Only highlight when there is a single, collapsed cursor (no selection).
    if (editor.selections.length !== 1 || !editor.selections[0].isEmpty) {
        clearHighlights(editor);
        return;
    }

    const client = getClient();
    if (!client) { clearHighlights(editor); return; }

    // Cancel any in-flight request before sending a new one.
    if (_cancellationSource) {
        _cancellationSource.cancel();
        _cancellationSource.dispose();
    }
    _cancellationSource = new vscode.CancellationTokenSource();
    const token = _cancellationSource.token;

    const pos = editor.selections[0].active;
    const params = {
        textDocument: { uri: editor.document.uri.toString() },
        position:     { line: pos.line, character: pos.character },
    };

    try {
        const highlights = await client.sendRequest(
            DocumentHighlightRequest.type,
            params,
            token
        );

        if (token.isCancellationRequested || !_pairDecorationType || !_occDecorationType) {
            return;
        }

        if (highlights && highlights.length > 0) {
            // DocumentHighlightKind.Write (= 3) → keyword pair → strong highlight
            // Everything else                   → identifier   → standard highlight
            const pairRanges = highlights
                .filter(h => h.kind === 3)
                .map(h => new vscode.Range(
                    new vscode.Position(h.range.start.line, h.range.start.character),
                    new vscode.Position(h.range.end.line,   h.range.end.character)
                ));
            const occRanges = highlights
                .filter(h => h.kind !== 3)
                .map(h => new vscode.Range(
                    new vscode.Position(h.range.start.line, h.range.start.character),
                    new vscode.Position(h.range.end.line,   h.range.end.character)
                ));

            editor.setDecorations(_pairDecorationType, pairRanges);
            editor.setDecorations(_occDecorationType,  occRanges);
        } else {
            clearHighlights(editor);
        }
    } catch {
        clearHighlights(editor);
    }
}

function clearHighlights(editor: vscode.TextEditor): void {
    _pairDecorationType && editor.setDecorations(_pairDecorationType, []);
    _occDecorationType  && editor.setDecorations(_occDecorationType,  []);
}

function clearAllHighlights(): void {
    for (const editor of vscode.window.visibleTextEditors) {
        clearHighlights(editor);
    }
}
