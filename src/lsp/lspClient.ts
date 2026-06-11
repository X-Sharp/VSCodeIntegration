import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { workspace } from 'vscode';
import {
    LanguageClient,
    LanguageClientOptions,
    RevealOutputChannelOn,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client: LanguageClient;

export function getClient(): LanguageClient | undefined {
    return client;
}

export function registerLSPClient(context: vscode.ExtensionContext) {

    const serverExe = context.asAbsolutePath(path.join('server', 'XSharpLanguageServer.exe'));

    if (!fs.existsSync(serverExe)) {
        vscode.window.showWarningMessage(
            'XSharp Language Server not found. IntelliSense will not be available. ' +
            `Expected: ${serverExe}`
        );
        return;
    }

    console.log('X# LSP Server : ' + serverExe);

    const outputChannel = vscode.window.createOutputChannel('XSharp Language Server');
    const traceChannel  = vscode.window.createOutputChannel('XSharp Language Server (Trace)');
    context.subscriptions.push(outputChannel, traceChannel);

    const serverOptions: ServerOptions = {
        run:   { command: serverExe, transport: TransportKind.stdio },
        debug: { command: serverExe, transport: TransportKind.stdio }
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [{ scheme: 'file', language: 'xsharp' }],
        outputChannel,
        traceOutputChannel: traceChannel,
        revealOutputChannelOn: RevealOutputChannelOn.Error,
        synchronize: {
            // Forward all xsharp.* settings to the server via workspace/didChangeConfiguration.
            configurationSection: 'xsharp',
            fileEvents: [
                workspace.createFileSystemWatcher('**/*.prg'),
                workspace.createFileSystemWatcher('**/*.prgx'),
                workspace.createFileSystemWatcher('**/*.xs'),
                workspace.createFileSystemWatcher('**/*.xsc'),
                workspace.createFileSystemWatcher('**/*.xsprg'),
                workspace.createFileSystemWatcher('**/*.ch'),
                workspace.createFileSystemWatcher('**/*.xh'),
            ]
        }
    };

    client = new LanguageClient(
        'xsharpLanguageServer',
        'X# Language Server',
        serverOptions,
        clientOptions
    );

    client.start();
    console.log('X# Language Server Client started.');
}

export function deactivateLSPClient(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}
