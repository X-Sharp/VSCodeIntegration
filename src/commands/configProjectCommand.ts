
import * as vscode from 'vscode';

import { findProjectFile } from '../utils/findProject';
import { xsProjReader } from '../utils/xsProjReader';
import { getConfigProjectHtml } from '../panels/configProject';

import { XMLParser, XMLBuilder } from 'fast-xml-parser';

function getNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function registerConfigProjectCommand(context: vscode.ExtensionContext) {

    const configureProjectCommand = vscode.commands.registerCommand('xsharp.configureProject', async () => {
        const nonce = getNonce();
        const panel = vscode.window.createWebviewPanel(
            'xsharpConfig',
            'Configure XSharp Project',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );
        const projectFile = await findProjectFile();
        if (!projectFile) {
            return;
        }
        const content = await vscode.workspace.fs.readFile(projectFile);
        const xmlText = Buffer.from(content).toString('utf8');
        const props = new xsProjReader(xmlText);
        const initialValues = {
            dialect: props.get('Dialect') ?? 'Core',
            outputType: props.get('OutputType') ?? 'Exe',
            
            lateBinding: props.get('LB') ?? 'false',
            namedArgs: props.get('namedargs') ?? 'false',
            unsafeCode: props.get('unsafe') ?? 'false',
            caseSensitive: props.get('CS') ?? 'false',
            initLocals: props.get('initlocals') ?? 'false',
            overflowEx: props.get('ovf') ?? 'false',
            zeroBasedArrays: props.get('AZ') ?? 'false',
            enforceSelf: props.get('EnforceSelf') ?? 'false',
            allowDot: props.get('Allowdot') ?? 'false',
            nullable: props.get('Nullable') ?? 'disable',
            enforceVirtualOverride: props.get('enforceoverride') ?? 'disable',
            allowOldStyle: props.get('allowoldstyleassignments') ?? 'disable',
            modernSyntax: props.get('modernsyntax') ?? 'disable'
            
        };

        panel.webview.html = getConfigProjectHtml(initialValues, nonce);

        panel.webview.onDidReceiveMessage(async message => {
            if (message.command === 'saveSettings') {
                const updatedXml = updateProjectXml(xmlText, message.values);
                await vscode.workspace.fs.writeFile(projectFile, Buffer.from(updatedXml, 'utf8'));
                vscode.window.showInformationMessage('Project settings saved.');
            }
        });

    });

    context.subscriptions.push(configureProjectCommand);

}

function updateProjectXml(xmlText: string, values: Record<string, string>): string {
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xmlText);
    const group = parsed?.Project?.PropertyGroup;
    if (!group) {
        return xmlText;
    }
    group.Dialect = values.dialect;
    group.OutputType = values.outputType;
    
    group.LB = values.lateBinding;
    group.namedargs = values.namedArgs;
    group.unsafe = values.unsafeCode;
    group.CS = values.caseSensitive;
    group.initLocals = values.initLocals;
    group.ovf = values.overflowEx;
    group.AZ = values.zeroBasedArrays;
    group.EnforceSelf = values.enforceSelf;
    group.Allowdot = values.allowDot;
    group.Nullable = values.nullable;
    group.enforceoverride = values.enforceVirtualOverride;
    group.allowoldstyleassignments = values.allowOldStyle;
    group.modernsyntax = values.modernSyntax;

    const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
    return builder.build(parsed);
}


