
import * as vscode from 'vscode';

import { findProjectFile } from '../utils/findProject';
import { xsProjReader } from '../utils/xsProjReader';
import { getConfigProjectHtml } from '../panels/configProject';

import {
    parseXml, buildXml, findElement, findElements, children, attr,
    setElementText, removeElement, setOrRemoveElementText
} from '../utils/msbuildXml';

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
            panel.dispose();
            return;
        }
        const content = await vscode.workspace.fs.readFile(projectFile);
        const xmlText = Buffer.from(content).toString('utf8');
        const props = new xsProjReader(xmlText);

        const projectNode = findElement(parseXml(xmlText), 'Project');
        const isSdkStyle = !!(projectNode && attr(projectNode, 'Sdk'));

        // ---- Per-configuration build values ----
        const configs = props.getConfigs();
        const effectiveConfigs = configs.length > 0 ? configs : ['Debug', 'Release'];

        const buildByConfig: Record<string, Record<string, string>> = {};
        for (const cfg of effectiveConfigs) {
            const r = (key: string) => props.resolveForConfig(cfg, key) ?? '';
            buildByConfig[cfg] = {
                outputPath:                r('OutputPath'),
                intermediateOutputPath:    r('IntermediateOutputPath'),
                platformTarget:            r('PlatformTarget'),
                optimize:                  r('Optimize'),
                prefer32Bit:               r('Prefer32Bit'),
                registerForComInterop:     r('RegisterForComInterop'),
                ppo:                       r('PPO'),
                defineConstants:           r('DefineConstants'),
                signAssembly:              r('SignAssembly'),
                delaySign:                 r('DelaySign'),
                assemblyOriginatorKeyFile: r('AssemblyOriginatorKeyFile'),
                warningLevel:              r('WarningLevel'),
                // SDK-style projects use WarningsAsErrors (code list, or '*' for all);
                // legacy projects use the plain boolean TreatWarningsAsErrors.
                warningsAsErrors:          r('WarningsAsErrors'),
                treatWarningsAsErrors:     r('TreatWarningsAsErrors') || 'false',
                documentationFile:         r('DocumentationFile'),
                useSharedCompilation:      r('UseSharedCompilation'),
                suppressRcWarnings:        r('SuppressRCWarnings'),
                commandLineOption:         r('CommandLineOption'),
                noWarn:                    r('NoWarn'),
            };
        }

        const initialValues = {
            // General
            assemblyName:                 props.get('AssemblyName') ?? '',
            rootNamespace:                props.get('RootNamespace') ?? '',
            outputType:                   props.get('OutputType') ?? 'Exe',
            targetFramework:              isSdkStyle
                ? (props.get('TargetFramework') ?? props.get('TargetFrameworks') ?? '')
                : (props.get('TargetFrameworkVersion') ?? ''),
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

        panel.webview.html = getConfigProjectHtml(initialValues, nonce, isSdkStyle, effectiveConfigs, buildByConfig);

        panel.webview.onDidReceiveMessage(async message => {
            if (message.command === 'saveSettings') {
                const updatedXml = updateProjectXml(
                    xmlText,
                    message.values,
                    isSdkStyle,
                    message.buildByConfig ?? {}
                );
                await vscode.workspace.fs.writeFile(projectFile, Buffer.from(updatedXml, 'utf8'));
                vscode.window.showInformationMessage('Project settings saved.');
            }
        });

    });

    context.subscriptions.push(configureProjectCommand);

}

function updateProjectXml(
    xmlText: string,
    values: Record<string, string>,
    isSdkStyle: boolean,
    buildByConfig: Record<string, Record<string, string>>
): string {
    const ast = parseXml(xmlText);
    const project = findElement(ast, 'Project');
    if (!project) {
        return xmlText;
    }
    const projectChildren = children(project);
    const allGroups = findElements(projectChildren, 'PropertyGroup');
    if (allGroups.length === 0) {
        return xmlText;
    }

    // ---- Global group (first unconditioned PropertyGroup) ----
    const group = allGroups.find((g: any) => !attr(g, 'Condition')) ?? allGroups[0];
    const gc = children(group);

    // General
    setElementText(gc, 'AssemblyName', values.assemblyName);
    setElementText(gc, 'RootNamespace', values.rootNamespace);
    setElementText(gc, 'OutputType', values.outputType);
    // Target framework: SDK-style projects use TargetFramework, legacy projects use
    // TargetFrameworkVersion — write the one matching the project style and remove
    // the other so we don't leave a stale property behind.
    if (isSdkStyle) {
        setElementText(gc, 'TargetFramework', values.targetFramework);
        removeElement(gc, 'TargetFrameworkVersion');
    } else {
        setElementText(gc, 'TargetFrameworkVersion', values.targetFramework);
        removeElement(gc, 'TargetFramework');
        removeElement(gc, 'TargetFrameworks');
    }
    setElementText(gc, 'Dialect',                      values.dialect);
    setElementText(gc, 'StartupObject',                values.startupObject);
    setElementText(gc, 'AutoGenerateBindingRedirects', values.autoGenerateBindingRedirects);
    setElementText(gc, 'NoWin32Manifest',              values.noWin32Manifest);
    setElementText(gc, 'UseNativeVersion',             values.useNativeVersion);
    setElementText(gc, 'VulcanCompatibleResources',    values.vulcanCompatibleResources);
    // Language
    setElementText(gc, 'LB',                      values.lateBinding);
    setElementText(gc, 'NamedArgs',               values.namedArgs);
    setElementText(gc, 'Unsafe',                  values.unsafeCode);
    setElementText(gc, 'CS',                      values.caseSensitive);
    setElementText(gc, 'InitLocals',               values.initLocals);
    setElementText(gc, 'OVF',                      values.overflowEx);
    setElementText(gc, 'AZ',                       values.zeroBasedArrays);
    setElementText(gc, 'EnforceSelf',              values.enforceSelf);
    setElementText(gc, 'Allowdot',                 values.allowDot);
    setElementText(gc, 'Nullable',                 values.nullable);
    setElementText(gc, 'EnforceOverride',          values.enforceVirtualOverride);
    setElementText(gc, 'AllowOldStyleAssignments', values.allowOldStyle);
    setElementText(gc, 'ModernSyntax',             values.modernSyntax);
    setElementText(gc, 'MemVar',                   values.memVar);
    setElementText(gc, 'Undeclared',               values.undeclared);
    setElementText(gc, 'INS',                      values.ins);
    setElementText(gc, 'NS',                       values.ns);
    setElementText(gc, 'NoStandardDefs',           values.noStandardDefs);
    setElementText(gc, 'IncludePaths',             values.includePaths);
    setElementText(gc, 'StandardDefs',             values.standardDefs);
    // Dialect
    setElementText(gc, 'Vo1',  values.vo1);  setElementText(gc, 'Vo2',  values.vo2);  setElementText(gc, 'Vo3',  values.vo3);
    setElementText(gc, 'Vo4',  values.vo4);  setElementText(gc, 'Vo5',  values.vo5);  setElementText(gc, 'Vo6',  values.vo6);
    setElementText(gc, 'Vo7',  values.vo7);  setElementText(gc, 'Vo8',  values.vo8);  setElementText(gc, 'Vo9',  values.vo9);
    setElementText(gc, 'Vo10', values.vo10); setElementText(gc, 'Vo11', values.vo11); setElementText(gc, 'Vo12', values.vo12);
    setElementText(gc, 'Vo13', values.vo13); setElementText(gc, 'Vo14', values.vo14); setElementText(gc, 'Vo15', values.vo15);
    setElementText(gc, 'Vo16', values.vo16); setElementText(gc, 'Vo17', values.vo17);
    setElementText(gc, 'Fox2', values.fox2);
    setElementText(gc, 'Xpp1', values.xpp1);
    // Package (SDK-style only)
    if (isSdkStyle) {
        setElementText(gc, 'AssemblyTitle',            values.assemblyTitle);
        setElementText(gc, 'Description',              values.description);
        setElementText(gc, 'Company',                  values.company);
        setElementText(gc, 'Copyright',                values.copyright);
        setElementText(gc, 'NeutralLanguage',          values.neutralLanguage);
        setElementText(gc, 'PackageId',                values.packageId);
        setElementText(gc, 'PackageVersion',           values.packageVersion);
        setElementText(gc, 'Authors',                  values.authors);
        setElementText(gc, 'PackageTags',              values.packageTags);
        setElementText(gc, 'PackageLicenseExpression', values.packageLicenseExpression);
        setElementText(gc, 'PackageProjectUrl',        values.packageProjectUrl);
        setElementText(gc, 'RepositoryUrl',            values.repositoryUrl);
        setElementText(gc, 'RepositoryType',           values.repositoryType);
        setElementText(gc, 'GeneratePackageOnBuild',   values.generatePackageOnBuild);
        setElementText(gc, 'IsPackable',               values.isPackable);
    }

    // ---- Per-configuration groups (Build tab) ----
    for (const [config, buildVals] of Object.entries(buildByConfig)) {
        // Find the first PropertyGroup whose Condition references this config name.
        let configGroup = allGroups.find((g: any) => {
            const cond: string = attr(g, 'Condition') ?? '';
            return cond.includes(`'${config}|`) || cond.includes(`"${config}|`);
        });

        if (!configGroup) {
            configGroup = {
                PropertyGroup: [],
                ':@': { '@_Condition': `'$(Configuration)|$(Platform)' == '${config}|AnyCPU'` }
            };
            projectChildren.push(configGroup);
            allGroups.push(configGroup);
        }
        const cgc = children(configGroup);

        // Write a property only when the value is non-empty; remove it otherwise
        // so that MSBuild defaults take effect (avoids littering the file).
        const set = (name: string, value: string) => setOrRemoveElementText(cgc, name, value);

        set('OutputPath',                buildVals.outputPath);
        set('IntermediateOutputPath',    buildVals.intermediateOutputPath);
        set('PlatformTarget',            buildVals.platformTarget);
        set('Optimize',                  buildVals.optimize);
        set('Prefer32Bit',               buildVals.prefer32Bit);
        set('RegisterForComInterop',     buildVals.registerForComInterop);
        set('PPO',                       buildVals.ppo);
        set('DefineConstants',           buildVals.defineConstants);
        set('SignAssembly',              buildVals.signAssembly);
        set('DelaySign',                 buildVals.delaySign);
        set('AssemblyOriginatorKeyFile', buildVals.assemblyOriginatorKeyFile);
        set('WarningLevel',              buildVals.warningLevel);
        // SDK-style: WarningsAsErrors (code list / '*' for all). Legacy: plain
        // boolean TreatWarningsAsErrors. Write only the one matching the project
        // style, and remove the other so we don't leave a stale property behind.
        if (isSdkStyle) {
            set('WarningsAsErrors', buildVals.warningsAsErrors);
            removeElement(cgc, 'TreatWarningsAsErrors');
        } else {
            set('TreatWarningsAsErrors', buildVals.treatWarningsAsErrors === 'true' ? 'True' : 'False');
            removeElement(cgc, 'WarningsAsErrors');
        }
        set('DocumentationFile',         buildVals.documentationFile);
        set('UseSharedCompilation',      buildVals.useSharedCompilation);
        set('SuppressRCWarnings',        buildVals.suppressRcWarnings);
        set('CommandLineOption',         buildVals.commandLineOption);
        set('NoWarn',                    buildVals.noWarn);
    }

    return buildXml(ast);
}
