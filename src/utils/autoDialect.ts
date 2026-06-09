import * as vscode from 'vscode';
import { xsProjReader } from './xsProjReader';

const KNOWN_DIALECTS = ['Core', 'VO', 'Vulcan', 'Harbour', 'FoxPro', 'XPP', 'dBase'];

function normalizeDialect(raw: string): string | undefined {
    return KNOWN_DIALECTS.find(d => d.toLowerCase() === raw.toLowerCase());
}

export async function syncDialectFromProject(): Promise<void> {
    const files = await vscode.workspace.findFiles('**/*.xsproj', '**/node_modules/**');
    if (files.length !== 1) { return; }

    let content: Uint8Array;
    try {
        content = await vscode.workspace.fs.readFile(files[0]);
    } catch {
        return;
    }

    const reader = new xsProjReader(Buffer.from(content).toString('utf8'));
    const cfg = vscode.workspace.getConfiguration('xsharp');
    const target = vscode.ConfigurationTarget.Workspace;

    const rawDialect = reader.get('Dialect');
    if (rawDialect) {
        const dialect = normalizeDialect(rawDialect);
        if (dialect && cfg.get<string>('dialect') !== dialect) {
            await cfg.update('dialect', dialect, target);
        }
    }

    const includePaths = reader.get('IncludePaths') ?? '';
    if (cfg.get<string>('includePaths') !== includePaths) {
        await cfg.update('includePaths', includePaths, target);
    }

    const defines = reader.get('DefineConstants') ?? '';
    if (cfg.get<string>('preprocessorSymbols') !== defines) {
        await cfg.update('preprocessorSymbols', defines, target);
    }
}
