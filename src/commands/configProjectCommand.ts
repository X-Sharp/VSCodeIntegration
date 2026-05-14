
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

        const parsedForSdk = new XMLParser({ ignoreAttributes: false }).parse(xmlText);
        const isSdkStyle = !!parsedForSdk?.Project?.['@_Sdk'];

        const initialValues = {
            // General
            assemblyName:                 props.get('AssemblyName') ?? '',
            rootNamespace:                props.get('RootNamespace') ?? '',
            outputType:                   props.get('OutputType') ?? 'Exe',
            targetFramework:              props.get('TargetFramework') ?? props.get('TargetFrameworks') ?? '',
            dialect:                      props.get('Dialect') ?? 'Core',
            startupObject:                props.get('StartupObject') ?? '',
            autoGenerateBindingRedirects: props.get('AutoGenerateBindingRedirects') ?? 'false',
            noWin32Manifest:              props.get('NoWin32Manifest') ?? 'false',
            useNativeVersion:             props.get('UseNativeVersion') ?? 'false',
            vulcanCompatibleResources:    props.get('VulcanCompatibleResources') ?? 'false',
            // Language - General
            lateBinding:            props.get('LB') ?? 'false',
            namedArgs:              props.get('NamedArgs') ?? 'false',
            unsafeCode:             props.get('Unsafe') ?? 'false',
            caseSensitive:          props.get('CS') ?? 'false',
            initLocals:             props.get('InitLocals') ?? 'false',
            overflowEx:             props.get('OVF') ?? 'false',
            zeroBasedArrays:        props.get('AZ') ?? 'false',
            enforceSelf:            props.get('EnforceSelf') ?? 'false',
            allowDot:               props.get('Allowdot') ?? 'false',
            nullable:               props.get('Nullable') ?? 'disable',
            enforceVirtualOverride: props.get('EnforceOverride') ?? 'false',
            allowOldStyle:          props.get('AllowOldStyleAssignments') ?? 'false',
            modernSyntax:           props.get('ModernSyntax') ?? 'false',
            // Language - Memory variables
            memVar:               props.get('MemVar') ?? 'false',
            undeclared:           props.get('Undeclared') ?? 'false',
            // Language - Namespaces
            ins:                  props.get('INS') ?? 'false',
            ns:                   props.get('NS') ?? 'false',
            // Language - Preprocessor
            noStandardDefs:       props.get('NoStandardDefs') ?? 'false',
            includePaths:         props.get('IncludePaths') ?? '',
            standardDefs:         props.get('StandardDefs') ?? '',
            // Dialect
            vo1:  props.get('Vo1')  ?? 'false',
            vo2:  props.get('Vo2')  ?? 'false',
            vo3:  props.get('Vo3')  ?? 'false',
            vo4:  props.get('Vo4')  ?? 'false',
            vo5:  props.get('Vo5')  ?? 'false',
            vo6:  props.get('Vo6')  ?? 'false',
            vo7:  props.get('Vo7')  ?? 'false',
            vo8:  props.get('Vo8')  ?? 'false',
            vo9:  props.get('Vo9')  ?? 'false',
            vo10: props.get('Vo10') ?? 'false',
            vo11: props.get('Vo11') ?? 'false',
            vo12: props.get('Vo12') ?? 'false',
            vo13: props.get('Vo13') ?? 'false',
            vo14: props.get('Vo14') ?? 'false',
            vo15: props.get('Vo15') ?? 'false',
            vo16: props.get('Vo16') ?? 'false',
            vo17: props.get('Vo17') ?? 'false',
            fox2: props.get('Fox2') ?? 'false',
            xpp1: props.get('Xpp1') ?? 'false',
            // Package - Assembly info
            assemblyTitle:             props.get('AssemblyTitle') ?? '',
            description:               props.get('Description') ?? '',
            company:                   props.get('Company') ?? '',
            copyright:                 props.get('Copyright') ?? '',
            neutralLanguage:           props.get('NeutralLanguage') ?? '',
            // Package - NuGet
            packageId:                 props.get('PackageId') ?? '',
            packageVersion:            props.get('PackageVersion') ?? '',
            authors:                   props.get('Authors') ?? '',
            packageTags:               props.get('PackageTags') ?? '',
            packageLicenseExpression:  props.get('PackageLicenseExpression') ?? '',
            packageProjectUrl:         props.get('PackageProjectUrl') ?? '',
            repositoryUrl:             props.get('RepositoryUrl') ?? '',
            repositoryType:            props.get('RepositoryType') ?? '',
            generatePackageOnBuild:    props.get('GeneratePackageOnBuild') ?? 'false',
            isPackable:                props.get('IsPackable') ?? 'false',
        };

        panel.webview.html = getConfigProjectHtml(initialValues, nonce, isSdkStyle);

        panel.webview.onDidReceiveMessage(async message => {
            if (message.command === 'saveSettings') {
                const updatedXml = updateProjectXml(xmlText, message.values, isSdkStyle);
                await vscode.workspace.fs.writeFile(projectFile, Buffer.from(updatedXml, 'utf8'));
                vscode.window.showInformationMessage('Project settings saved.');
            }
        });

    });

    context.subscriptions.push(configureProjectCommand);

}

function updateProjectXml(xmlText: string, values: Record<string, string>, isSdkStyle: boolean): string {
    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(xmlText);
    const rawGroup = parsed?.Project?.PropertyGroup;
    if (!rawGroup) {
        return xmlText;
    }
    // Handle both a single PropertyGroup object and an array of groups
    const group = Array.isArray(rawGroup) ? rawGroup[0] : rawGroup;

    // General
    group.AssemblyName                 = values.assemblyName;
    group.RootNamespace                = values.rootNamespace;
    group.OutputType                   = values.outputType;
    group.TargetFramework              = values.targetFramework;
    group.Dialect                      = values.dialect;
    group.StartupObject                = values.startupObject;
    group.AutoGenerateBindingRedirects = values.autoGenerateBindingRedirects;
    group.NoWin32Manifest              = values.noWin32Manifest;
    group.UseNativeVersion             = values.useNativeVersion;
    group.VulcanCompatibleResources    = values.vulcanCompatibleResources;
    // Language
    group.LB                      = values.lateBinding;
    group.NamedArgs               = values.namedArgs;
    group.Unsafe                  = values.unsafeCode;
    group.CS                      = values.caseSensitive;
    group.InitLocals               = values.initLocals;
    group.OVF                      = values.overflowEx;
    group.AZ                       = values.zeroBasedArrays;
    group.EnforceSelf              = values.enforceSelf;
    group.Allowdot                 = values.allowDot;
    group.Nullable                 = values.nullable;
    group.EnforceOverride          = values.enforceVirtualOverride;
    group.AllowOldStyleAssignments = values.allowOldStyle;
    group.ModernSyntax             = values.modernSyntax;
    group.MemVar                   = values.memVar;
    group.Undeclared               = values.undeclared;
    group.INS                      = values.ins;
    group.NS                       = values.ns;
    group.NoStandardDefs           = values.noStandardDefs;
    group.IncludePaths             = values.includePaths;
    group.StandardDefs             = values.standardDefs;
    // Dialect
    group.Vo1  = values.vo1;  group.Vo2  = values.vo2;  group.Vo3  = values.vo3;
    group.Vo4  = values.vo4;  group.Vo5  = values.vo5;  group.Vo6  = values.vo6;
    group.Vo7  = values.vo7;  group.Vo8  = values.vo8;  group.Vo9  = values.vo9;
    group.Vo10 = values.vo10; group.Vo11 = values.vo11; group.Vo12 = values.vo12;
    group.Vo13 = values.vo13; group.Vo14 = values.vo14; group.Vo15 = values.vo15;
    group.Vo16 = values.vo16; group.Vo17 = values.vo17;
    group.Fox2 = values.fox2;
    group.Xpp1 = values.xpp1;
    // Package (SDK-style only)
    if (isSdkStyle) {
        group.AssemblyTitle            = values.assemblyTitle;
        group.Description              = values.description;
        group.Company                  = values.company;
        group.Copyright                = values.copyright;
        group.NeutralLanguage          = values.neutralLanguage;
        group.PackageId                = values.packageId;
        group.PackageVersion           = values.packageVersion;
        group.Authors                  = values.authors;
        group.PackageTags              = values.packageTags;
        group.PackageLicenseExpression = values.packageLicenseExpression;
        group.PackageProjectUrl        = values.packageProjectUrl;
        group.RepositoryUrl            = values.repositoryUrl;
        group.RepositoryType           = values.repositoryType;
        group.GeneratePackageOnBuild   = values.generatePackageOnBuild;
        group.IsPackable               = values.isPackable;
    }

    const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
    return builder.build(parsed);
}
