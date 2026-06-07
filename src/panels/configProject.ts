
export function getConfigProjectHtml(
  values: Record<string, string>,
  nonce: string,
  isSdkStyle: boolean,
  configs: string[],
  buildByConfig: Record<string, Record<string, string>>
): string {
  const s = {
    // General
    assemblyName:                 values.assemblyName ?? '',
    rootNamespace:                values.rootNamespace ?? '',
    outputType:                   values.outputType ?? 'Exe',
    targetFramework:              values.targetFramework ?? '',
    dialect:                      values.dialect ?? 'Core',
    startupObject:                values.startupObject ?? '',
    autoGenerateBindingRedirects: values.autoGenerateBindingRedirects ?? 'false',
    noWin32Manifest:              values.noWin32Manifest ?? 'false',
    useNativeVersion:             values.useNativeVersion ?? 'false',
    vulcanCompatibleResources:    values.vulcanCompatibleResources ?? 'false',
    // Language - General
    lateBinding:          values.lateBinding ?? 'false',
    namedArgs:            values.namedArgs ?? 'false',
    unsafeCode:           values.unsafeCode ?? 'false',
    caseSensitive:        values.caseSensitive ?? 'false',
    initLocals:           values.initLocals ?? 'false',
    overflowEx:           values.overflowEx ?? 'false',
    zeroBasedArrays:      values.zeroBasedArrays ?? 'false',
    enforceSelf:          values.enforceSelf ?? 'false',
    allowDot:             values.allowDot ?? 'false',
    nullable:             values.nullable ?? 'disable',
    enforceVirtualOverride: values.enforceVirtualOverride ?? 'false',
    allowOldStyle:        values.allowOldStyle ?? 'false',
    modernSyntax:         values.modernSyntax ?? 'false',
    // Language - Memory variables
    memVar:               values.memVar ?? 'false',
    undeclared:           values.undeclared ?? 'false',
    // Language - Namespaces
    ins:                  values.ins ?? 'false',
    ns:                   values.ns ?? 'false',
    // Language - Preprocessor
    noStandardDefs:       values.noStandardDefs ?? 'false',
    includePaths:         values.includePaths ?? '',
    standardDefs:         values.standardDefs ?? '',
    // Dialect - All dialects
    vo1:  values.vo1  ?? 'false',
    vo2:  values.vo2  ?? 'false',
    vo3:  values.vo3  ?? 'false',
    vo4:  values.vo4  ?? 'false',
    vo8:  values.vo8  ?? 'false',
    vo9:  values.vo9  ?? 'false',
    vo10: values.vo10 ?? 'false',
    // Dialect - Not in Core
    vo5:  values.vo5  ?? 'false',
    vo6:  values.vo6  ?? 'false',
    vo7:  values.vo7  ?? 'false',
    vo11: values.vo11 ?? 'false',
    vo12: values.vo12 ?? 'false',
    vo13: values.vo13 ?? 'false',
    vo14: values.vo14 ?? 'false',
    vo15: values.vo15 ?? 'false',
    vo16: values.vo16 ?? 'false',
    vo17: values.vo17 ?? 'false',
    // Dialect - specific
    fox2: values.fox2 ?? 'false',
    xpp1: values.xpp1 ?? 'false',
    // Package - Assembly info
    assemblyTitle:             values.assemblyTitle ?? '',
    description:               values.description ?? '',
    company:                   values.company ?? '',
    copyright:                 values.copyright ?? '',
    neutralLanguage:           values.neutralLanguage ?? '',
    // Package - NuGet
    packageId:                 values.packageId ?? '',
    packageVersion:            values.packageVersion ?? '',
    authors:                   values.authors ?? '',
    packageTags:               values.packageTags ?? '',
    packageLicenseExpression:  values.packageLicenseExpression ?? '',
    packageProjectUrl:         values.packageProjectUrl ?? '',
    repositoryUrl:             values.repositoryUrl ?? '',
    repositoryType:            values.repositoryType ?? '',
    generatePackageOnBuild:    values.generatePackageOnBuild ?? 'false',
    isPackable:                values.isPackable ?? 'false',
    // Build — config names + per-config values (JS drives the fields)
    configs,
    buildByConfig,
  };

  const stateJson = JSON.stringify(s);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <style>
    body { padding: 8px 12px; font-size: 13px; }
    h2 { margin: 0 0 10px 0; }
    .tabs { display: flex; border-bottom: 1px solid var(--vscode-panel-border, #444); margin-bottom: 12px; }
    .tab { padding: 6px 16px; cursor: pointer; border-bottom: 2px solid transparent; user-select: none; }
    .tab:hover { background: var(--vscode-list-hoverBackground, #2a2d2e); }
    .tab.active { border-bottom-color: var(--vscode-focusBorder, #007fd4); font-weight: bold; }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }
    .section-title { font-weight: bold; margin: 14px 0 5px 0; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 0 24px; }
    .field { margin: 5px 0; }
    .field-label { margin-bottom: 2px; }
    input[type=text], select, textarea {
      width: 100%; box-sizing: border-box;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border, #555);
      padding: 3px 6px;
    }
    textarea { height: 58px; resize: vertical; }
    .cb { display: flex; align-items: center; gap: 8px; margin: 4px 0; cursor: pointer; }
    .cb input { cursor: pointer; flex-shrink: 0; }
    .cb.off { opacity: 0.45; cursor: not-allowed; }
    .cb.off input { pointer-events: none; }
    .cfg-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
    .cfg-row strong { white-space: nowrap; }
    .cfg-row select { width: auto; min-width: 130px; }
    .actions { margin-top: 16px; display: flex; gap: 8px; }
    button { padding: 5px 16px; cursor: pointer; border: none;
      background: var(--vscode-button-background, #0e639c);
      color: var(--vscode-button-foreground, #fff); }
    button#reset {
      background: var(--vscode-button-secondaryBackground, #3a3d41);
      color: var(--vscode-button-secondaryForeground, #ccc); }
  </style>
</head>
<body>
  <h2>XSharp Project Settings</h2>

  <div class="tabs">
    <div class="tab active" data-tab="general">General</div>
    <div class="tab" data-tab="language">Language</div>
    <div class="tab" data-tab="build">Build</div>
    <div class="tab" data-tab="dialect">Dialect</div>
    ${isSdkStyle ? '<div class="tab" data-tab="package">Package</div>' : ''}
  </div>

  <!-- ===================== GENERAL ===================== -->
  <div id="tab-general" class="tab-panel active">
    <div class="two-col">
      <div>
        <div class="field">
          <div class="field-label">Application Name:</div>
          <input type="text" id="assemblyName" value="${esc(s.assemblyName)}">
        </div>
        <div class="field">
          <div class="field-label">${isSdkStyle ? 'Target Framework:' : 'Target Framework Version:'}</div>
          <input type="text" id="targetFramework" value="${esc(s.targetFramework)}" placeholder="${isSdkStyle ? 'e.g. net48, net8.0' : 'e.g. v4.6, v4.7.2'}">
        </div>
        <div class="field">
          <div class="field-label">Dialect:</div>
          <select id="dialect">${renderOpts(['Core','VO','Vulcan','FoxPro','Harbour','XPP'], s.dialect)}</select>
        </div>
        ${cb('autoGenerateBindingRedirects', s.autoGenerateBindingRedirects, 'Auto-generate binding redirects')}
        <div class="section-title">Resources</div>
        ${cb('noWin32Manifest',           s.noWin32Manifest,           'Suppress default Win32 manifest')}
        ${cb('useNativeVersion',          s.useNativeVersion,          'Prefer native version')}
        ${cb('vulcanCompatibleResources', s.vulcanCompatibleResources, 'Vulcan compatible managed resources')}
      </div>
      <div>
        <div class="field">
          <div class="field-label">Default Namespace:</div>
          <input type="text" id="rootNamespace" value="${esc(s.rootNamespace)}">
        </div>
        <div class="field">
          <div class="field-label">Output Type:</div>
          <select id="outputType">${renderOpts(['Exe','WinExe','Library','Module'], s.outputType)}</select>
        </div>
        <div class="field">
          <div class="field-label">Startup Object:</div>
          <input type="text" id="startupObject" value="${esc(s.startupObject)}">
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== LANGUAGE ===================== -->
  <div id="tab-language" class="tab-panel">
    <div class="two-col">
      <div>
        <div class="section-title">General</div>
        ${cb('lateBinding',           s.lateBinding,           'Allow Late Binding')}
        ${cb('namedArgs',             s.namedArgs,             'Allow Named Arguments')}
        ${cb('unsafeCode',            s.unsafeCode,            'Allow Unsafe Code')}
        ${cb('caseSensitive',         s.caseSensitive,         'Case Sensitive')}
        ${cb('initLocals',            s.initLocals,            'Initialize Local Variables')}
        ${cb('overflowEx',            s.overflowEx,            'Overflow Exceptions')}
        ${cb('zeroBasedArrays',       s.zeroBasedArrays,       'Use Zero Based Arrays')}
        ${cb('enforceSelf',           s.enforceSelf,           'Enforce SELF')}
        ${cb('allowDot',              s.allowDot,              'Allow Dot for instance members')}
        <label class="cb"><input type="checkbox" id="nullable" ${s.nullable === 'enable' ? 'checked' : ''}>Enable Nullable</label>
        ${cb('enforceVirtualOverride', s.enforceVirtualOverride, 'Enforce VIRTUAL / OVERRIDE')}
        ${cb('allowOldStyle',         s.allowOldStyle,         'Allow Old Style assignments')}
        ${cb('modernSyntax',          s.modernSyntax,          'Modern Syntax')}
      </div>
      <div>
        <div class="section-title">Memory variables</div>
        ${cb('memVar',         s.memVar,         'Memory variables')}
        ${cb('undeclared',     s.undeclared,     'Undeclared variables')}
        <div class="section-title">Namespaces</div>
        ${cb('ins',            s.ins,            'Implicit namespace imports')}
        ${cb('ns',             s.ns,             'Namespaces')}
        <div class="section-title">Preprocessor</div>
        ${cb('noStandardDefs', s.noStandardDefs, 'Suppress standard definitions')}
        <div class="field-label" style="margin-top:10px">Include Paths:</div>
        <div class="field"><input type="text" id="includePaths" value="${esc(s.includePaths)}"></div>
        <div class="field-label" style="margin-top:6px">Standard Definitions:</div>
        <div class="field"><input type="text" id="standardDefs" value="${esc(s.standardDefs)}"></div>
      </div>
    </div>
  </div>

  <!-- ===================== BUILD ===================== -->
  <div id="tab-build" class="tab-panel">
    <div class="cfg-row">
      <strong>Configuration:</strong>
      <select id="buildConfig">
        ${configs.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('')}
      </select>
    </div>
    <div class="two-col">
      <div>
        <div class="section-title">Output</div>
        <div class="field">
          <div class="field-label">Output Path:</div>
          <input type="text" id="outputPath" placeholder="e.g. bin\\Debug\\">
        </div>
        <div class="field">
          <div class="field-label">Intermediate Path:</div>
          <input type="text" id="intermediateOutputPath" placeholder="e.g. obj\\Debug\\">
        </div>
        <div class="field">
          <div class="field-label">Platform Target:</div>
          <select id="platformTarget">
            <option value="AnyCPU">AnyCPU</option>
            <option value="x86">x86</option>
            <option value="x64">x64</option>
            <option value="arm">arm</option>
            <option value="arm64">arm64</option>
          </select>
        </div>
        <div class="section-title">Code Generation</div>
        <label class="cb"><input type="checkbox" id="optimize">Optimize code</label>
        <label class="cb"><input type="checkbox" id="prefer32Bit">Prefer 32-bit</label>
        <label class="cb"><input type="checkbox" id="registerForComInterop">Register for COM Interop</label>
        <div class="section-title">Preprocessor</div>
        <label class="cb"><input type="checkbox" id="ppo">Generate PPO files</label>
        <div class="field">
          <div class="field-label">Define Constants:</div>
          <input type="text" id="defineConstants" placeholder="e.g. DEBUG;TRACE">
        </div>
        <div class="section-title">Signing</div>
        <label class="cb"><input type="checkbox" id="signAssembly">Sign the assembly</label>
        <label class="cb"><input type="checkbox" id="delaySign">Delay sign only</label>
        <div class="field">
          <div class="field-label">Key File:</div>
          <input type="text" id="assemblyOriginatorKeyFile">
        </div>
      </div>
      <div>
        <div class="section-title">Warnings</div>
        <div class="field">
          <div class="field-label">Warning Level:</div>
          <select id="warningLevel">
            <option value="0">0</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
          </select>
        </div>
        ${isSdkStyle ? `
        <div class="field">
          <div class="field-label">Treat warnings as errors:</div>
          <select id="warningsTreatment">
            <option value="none">None</option>
            <option value="all">All</option>
            <option value="specific">Specific warnings</option>
          </select>
        </div>
        <div class="field" id="warningsAsErrorsField" style="display:none">
          <div class="field-label">Warning codes (semicolon-separated):</div>
          <input type="text" id="warningsAsErrors" placeholder="e.g. CS0168;CS0219">
        </div>
        ` : `
        <label class="cb"><input type="checkbox" id="treatWarningsAsErrors">Treat warnings as errors</label>
        `}
        <div class="field">
          <div class="field-label">Suppress Warnings (NoWarn):</div>
          <input type="text" id="noWarn" placeholder="e.g. CS0168;CS0219">
        </div>
        <div class="section-title">XML Documentation</div>
        <label class="cb"><input type="checkbox" id="xmlDocEnabled">Generate XML documentation file</label>
        <div class="field" id="documentationFileField" style="display:none">
          <input type="text" id="documentationFile" placeholder="e.g. bin\\Debug\\MyProject.xml">
        </div>
        <div class="section-title">Miscellaneous</div>
        <label class="cb"><input type="checkbox" id="useSharedCompilation">Use shared compilation</label>
        <label class="cb"><input type="checkbox" id="suppressRcWarnings">Suppress RC warnings</label>
        <div class="field">
          <div class="field-label">Additional compiler options:</div>
          <input type="text" id="commandLineOption">
        </div>
      </div>
    </div>
  </div>

  <!-- ===================== DIALECT ===================== -->
  <div id="tab-dialect" class="tab-panel">
    <div class="two-col">
      <div>
        <div class="section-title">All Dialects</div>
        ${cb('vo1',  s.vo1,  'VO1 - Compatible conversions (string/symbol)')}
        ${cb('vo3',  s.vo3,  'VO3 - All instance methods virtual')}
        ${cb('vo10', s.vo10, 'VO10 - Compatible IIF behavior')}
        ${cb('vo8',  s.vo8,  'VO8 - Compatible preprocessor')}
        ${cb('vo9',  s.vo9,  'VO9 - Allow missing RETURN statement')}
        ${cb('vo4',  s.vo4,  'VO4 - Compatible operators')}
        ${cb('vo2',  s.vo2,  'VO2 - Initialize local variables')}
      </div>
      <div>
        <div class="section-title">Not in Core Dialect</div>
        ${cb('vo12', s.vo12, 'VO12 - Compatible integer divisions')}
        ${cb('vo11', s.vo11, 'VO11 - Compatible numeric string arithmetic')}
        ${cb('vo13', s.vo13, 'VO13 - Compatible string comparisons')}
        ${cb('vo16', s.vo16, 'VO16 - Compatible arrays')}
        ${cb('vo5',  s.vo5,  'VO5 - Clipper compatible method calls')}
        ${cb('vo6',  s.vo6,  'VO6 - Resolve typed function PTR to PTR')}
        ${cb('vo15', s.vo15, 'VO15 - Treat [] as indexed access')}
        ${cb('vo14', s.vo14, 'VO14 - Use FLOAT for numerics')}
        ${cb('vo17', s.vo17, 'VO17 - Compatible structure types')}
        ${cb('vo7',  s.vo7,  'VO7 - Compatible implicit casts')}
      </div>
    </div>
    <div class="section-title">Visual FoxPro Compatibility</div>
    ${cb('fox2', s.fox2, 'Fox2 - Visual FoxPro compatibility (FoxPro dialect only)')}
    <div class="section-title">Xbase++ Compatibility</div>
    ${cb('xpp1', s.xpp1, 'Xpp1 - Xbase++ compatibility (XPP dialect only)')}
  </div>

  <!-- ===================== PACKAGE (SDK-style only) ===================== -->
  ${isSdkStyle ? '' : '<!--'}
  <div id="tab-package" class="tab-panel">
    <div class="section-title" style="margin-top:0">Assembly Information</div>
    ${tf('assemblyTitle',    s.assemblyTitle,    'Title:')}
    <div class="field">
      <div class="field-label">Description:</div>
      <textarea id="description">${esc(s.description)}</textarea>
    </div>
    ${tf('company',          s.company,          'Company:')}
    ${tf('copyright',        s.copyright,        'Copyright:')}
    ${tf('neutralLanguage',  s.neutralLanguage,  'Neutral Language:', 'e.g. en-US')}
    <div class="section-title">NuGet Package</div>
    ${tf('packageId',                s.packageId,               'Package ID:')}
    ${tf('packageVersion',           s.packageVersion,          'Package Version:', 'e.g. 1.0.0')}
    ${tf('authors',                  s.authors,                 'Authors:', 'Semicolon-separated')}
    ${tf('packageTags',              s.packageTags,             'Tags:', 'Semicolon-delimited')}
    ${tf('packageLicenseExpression', s.packageLicenseExpression,'License Expression (SPDX):', 'e.g. MIT')}
    ${tf('packageProjectUrl',        s.packageProjectUrl,       'Project URL:')}
    ${tf('repositoryUrl',            s.repositoryUrl,           'Repository URL:')}
    ${tf('repositoryType',           s.repositoryType,          'Repository Type:', 'e.g. git')}
    ${cb('generatePackageOnBuild', s.generatePackageOnBuild, 'Generate NuGet package on build')}
    ${cb('isPackable',             s.isPackable,             'Package this project')}
  </div>
  ${isSdkStyle ? '' : '-->'}

  <div class="actions">
    <button id="reset">Reset</button>
    <button id="save">Save</button>
  </div>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const state = ${stateJson};
    vscode.setState(state);

    // ---- Tab switching ----
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        const name = tab.dataset.tab;
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + name).classList.add('active');
      });
    });

    // ---- General / Dialect: enable/disable options based on dialect ----
    const NOT_IN_CORE = ['vo5','vo6','vo7','vo11','vo12','vo13','vo14','vo15','vo16','vo17'];
    function updateDialectDeps(dialect) {
      const isCore   = dialect === 'Core';
      const isFoxPro = dialect === 'FoxPro';
      const isXPP    = dialect === 'XPP';
      NOT_IN_CORE.forEach(id => setDisabled(id, isCore));
      setDisabled('fox2', !isFoxPro);
      setDisabled('xpp1', !isXPP);
    }
    function setDisabled(id, disabled) {
      const el = document.getElementById(id);
      if (!el) return;
      el.disabled = disabled;
      el.closest('.cb').classList.toggle('off', disabled);
    }
    document.getElementById('dialect').addEventListener('change', e => updateDialectDeps(e.target.value));
    updateDialectDeps(state.dialect);

    // ---- Build tab ----
    let buildValues = JSON.parse(JSON.stringify(state.buildByConfig));
    let currentBuildConfig = state.configs[0] || 'Debug';

    function loadBuildConfig(config) {
      const v = buildValues[config] || {};
      const t = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
      const b = (id, val) => { const el = document.getElementById(id); if (el) el.checked = (val || '').toLowerCase() === 'true'; };

      t('outputPath',               v.outputPath);
      t('intermediateOutputPath',   v.intermediateOutputPath);
      const pt = document.getElementById('platformTarget');
      if (pt) pt.value = v.platformTarget || 'AnyCPU';

      b('optimize',              v.optimize);
      b('prefer32Bit',           v.prefer32Bit);
      b('registerForComInterop', v.registerForComInterop);
      b('ppo',                   v.ppo);
      t('defineConstants',       v.defineConstants);
      b('signAssembly',          v.signAssembly);
      b('delaySign',             v.delaySign);
      t('assemblyOriginatorKeyFile', v.assemblyOriginatorKeyFile);

      const wl = document.getElementById('warningLevel');
      if (wl) wl.value = v.warningLevel || '4';

      ${isSdkStyle ? `
      // Treat warnings as errors: derive treatment from raw WarningsAsErrors value
      const wae = v.warningsAsErrors || '';
      const wt  = document.getElementById('warningsTreatment');
      const waef = document.getElementById('warningsAsErrorsField');
      const waei = document.getElementById('warningsAsErrors');
      if (wae === '*') {
        if (wt) wt.value = 'all';
      } else if (wae !== '') {
        if (wt) wt.value = 'specific';
        if (waei) waei.value = wae;
      } else {
        if (wt) wt.value = 'none';
        if (waei) waei.value = '';
      }
      if (waef) waef.style.display = (wt && wt.value === 'specific') ? 'block' : 'none';
      ` : `
      b('treatWarningsAsErrors', v.treatWarningsAsErrors);
      `}

      t('noWarn', v.noWarn);

      // XML documentation
      const xmlEnabled = !!(v.documentationFile && v.documentationFile !== '');
      const xmlCb  = document.getElementById('xmlDocEnabled');
      const docFld = document.getElementById('documentationFileField');
      if (xmlCb)  xmlCb.checked = xmlEnabled;
      if (docFld) docFld.style.display = xmlEnabled ? 'block' : 'none';
      t('documentationFile', v.documentationFile);

      b('useSharedCompilation', v.useSharedCompilation);
      b('suppressRcWarnings',   v.suppressRcWarnings);
      t('commandLineOption',    v.commandLineOption);
    }

    function captureBuildConfig(config) {
      if (!buildValues[config]) buildValues[config] = {};
      const v = buildValues[config];
      const t = id => (document.getElementById(id) || {}).value || '';
      const b = id => { const el = document.getElementById(id); return el && el.checked ? 'true' : 'false'; };

      v.outputPath               = t('outputPath');
      v.intermediateOutputPath   = t('intermediateOutputPath');
      v.platformTarget           = t('platformTarget');
      v.optimize                 = b('optimize');
      v.prefer32Bit              = b('prefer32Bit');
      v.registerForComInterop    = b('registerForComInterop');
      v.ppo                      = b('ppo');
      v.defineConstants          = t('defineConstants');
      v.signAssembly             = b('signAssembly');
      v.delaySign                = b('delaySign');
      v.assemblyOriginatorKeyFile= t('assemblyOriginatorKeyFile');
      v.warningLevel             = t('warningLevel');

      ${isSdkStyle ? `
      const treatment = t('warningsTreatment');
      v.warningsAsErrors = treatment === 'all' ? '*'
                         : treatment === 'specific' ? t('warningsAsErrors')
                         : '';
      ` : `
      v.treatWarningsAsErrors = b('treatWarningsAsErrors');
      `}

      v.noWarn             = t('noWarn');
      const xmlCb          = document.getElementById('xmlDocEnabled');
      v.documentationFile  = xmlCb && xmlCb.checked ? t('documentationFile') : '';
      v.useSharedCompilation = b('useSharedCompilation');
      v.suppressRcWarnings   = b('suppressRcWarnings');
      v.commandLineOption    = t('commandLineOption');
    }

    // Config selector switches displayed fields
    document.getElementById('buildConfig').addEventListener('change', e => {
      captureBuildConfig(currentBuildConfig);
      currentBuildConfig = e.target.value;
      loadBuildConfig(currentBuildConfig);
    });

    // Show/hide specific-warnings text box
    const warningsTreatmentEl = document.getElementById('warningsTreatment');
    if (warningsTreatmentEl) {
      warningsTreatmentEl.addEventListener('change', e => {
        document.getElementById('warningsAsErrorsField').style.display =
          e.target.value === 'specific' ? 'block' : 'none';
      });
    }

    // Show/hide documentation file path
    document.getElementById('xmlDocEnabled').addEventListener('change', e => {
      document.getElementById('documentationFileField').style.display =
        e.target.checked ? 'block' : 'none';
    });

    // Populate Build tab on load
    loadBuildConfig(currentBuildConfig);

    // ---- Reset ----
    document.getElementById('reset').addEventListener('click', () => {
      const t = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
      const b = (id, v) => { const el = document.getElementById(id); if (el) el.checked = v === 'true'; };
      // General
      t('assemblyName', state.assemblyName);
      t('rootNamespace', state.rootNamespace);
      t('outputType', state.outputType);
      t('targetFramework', state.targetFramework);
      t('dialect', state.dialect);
      t('startupObject', state.startupObject);
      b('autoGenerateBindingRedirects', state.autoGenerateBindingRedirects);
      b('noWin32Manifest', state.noWin32Manifest);
      b('useNativeVersion', state.useNativeVersion);
      b('vulcanCompatibleResources', state.vulcanCompatibleResources);
      // Language
      b('lateBinding', state.lateBinding); b('namedArgs', state.namedArgs);
      b('unsafeCode', state.unsafeCode); b('caseSensitive', state.caseSensitive);
      b('initLocals', state.initLocals); b('overflowEx', state.overflowEx);
      b('zeroBasedArrays', state.zeroBasedArrays); b('enforceSelf', state.enforceSelf);
      b('allowDot', state.allowDot);
      document.getElementById('nullable').checked = state.nullable === 'enable';
      b('enforceVirtualOverride', state.enforceVirtualOverride);
      b('allowOldStyle', state.allowOldStyle); b('modernSyntax', state.modernSyntax);
      b('memVar', state.memVar); b('undeclared', state.undeclared);
      b('ins', state.ins); b('ns', state.ns); b('noStandardDefs', state.noStandardDefs);
      t('includePaths', state.includePaths); t('standardDefs', state.standardDefs);
      // Dialect
      ['vo1','vo2','vo3','vo4','vo5','vo6','vo7','vo8','vo9','vo10',
       'vo11','vo12','vo13','vo14','vo15','vo16','vo17','fox2','xpp1']
        .forEach(id => b(id, state[id]));
      // Build
      buildValues = JSON.parse(JSON.stringify(state.buildByConfig));
      loadBuildConfig(currentBuildConfig);
      // Package
      t('assemblyTitle', state.assemblyTitle); t('description', state.description);
      t('company', state.company); t('copyright', state.copyright);
      t('neutralLanguage', state.neutralLanguage);
      t('packageId', state.packageId); t('packageVersion', state.packageVersion);
      t('authors', state.authors); t('packageTags', state.packageTags);
      t('packageLicenseExpression', state.packageLicenseExpression);
      t('packageProjectUrl', state.packageProjectUrl);
      t('repositoryUrl', state.repositoryUrl); t('repositoryType', state.repositoryType);
      b('generatePackageOnBuild', state.generatePackageOnBuild);
      b('isPackable', state.isPackable);
      updateDialectDeps(state.dialect);
    });

    // ---- Save ----
    document.getElementById('save').addEventListener('click', () => {
      // Flush the currently visible build config before collecting everything.
      captureBuildConfig(currentBuildConfig);

      const g = id => document.getElementById(id);
      const bool = id => g(id) && g(id).checked ? 'true' : 'false';
      const text = id => g(id) ? g(id).value : '';
      vscode.postMessage({ command: 'saveSettings',
        buildByConfig: buildValues,
        values: {
          // General
          assemblyName: text('assemblyName'), rootNamespace: text('rootNamespace'),
          outputType: text('outputType'), targetFramework: text('targetFramework'),
          dialect: text('dialect'), startupObject: text('startupObject'),
          autoGenerateBindingRedirects: bool('autoGenerateBindingRedirects'),
          noWin32Manifest: bool('noWin32Manifest'), useNativeVersion: bool('useNativeVersion'),
          vulcanCompatibleResources: bool('vulcanCompatibleResources'),
          // Language
          lateBinding: bool('lateBinding'), namedArgs: bool('namedArgs'),
          unsafeCode: bool('unsafeCode'), caseSensitive: bool('caseSensitive'),
          initLocals: bool('initLocals'), overflowEx: bool('overflowEx'),
          zeroBasedArrays: bool('zeroBasedArrays'), enforceSelf: bool('enforceSelf'),
          allowDot: bool('allowDot'),
          nullable: g('nullable') && g('nullable').checked ? 'enable' : 'disable',
          enforceVirtualOverride: bool('enforceVirtualOverride'),
          allowOldStyle: bool('allowOldStyle'), modernSyntax: bool('modernSyntax'),
          memVar: bool('memVar'), undeclared: bool('undeclared'),
          ins: bool('ins'), ns: bool('ns'), noStandardDefs: bool('noStandardDefs'),
          includePaths: text('includePaths'), standardDefs: text('standardDefs'),
          // Dialect
          vo1: bool('vo1'), vo2: bool('vo2'), vo3: bool('vo3'), vo4: bool('vo4'),
          vo5: bool('vo5'), vo6: bool('vo6'), vo7: bool('vo7'), vo8: bool('vo8'),
          vo9: bool('vo9'), vo10: bool('vo10'), vo11: bool('vo11'), vo12: bool('vo12'),
          vo13: bool('vo13'), vo14: bool('vo14'), vo15: bool('vo15'), vo16: bool('vo16'),
          vo17: bool('vo17'), fox2: bool('fox2'), xpp1: bool('xpp1'),
          // Package
          assemblyTitle: text('assemblyTitle'), description: text('description'),
          company: text('company'), copyright: text('copyright'),
          neutralLanguage: text('neutralLanguage'),
          packageId: text('packageId'), packageVersion: text('packageVersion'),
          authors: text('authors'), packageTags: text('packageTags'),
          packageLicenseExpression: text('packageLicenseExpression'),
          packageProjectUrl: text('packageProjectUrl'),
          repositoryUrl: text('repositoryUrl'), repositoryType: text('repositoryType'),
          generatePackageOnBuild: bool('generatePackageOnBuild'),
          isPackable: bool('isPackable'),
        }
      });
    });
  </script>
</body>
</html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderOpts(options: string[], selected: string): string {
  return options.map(o =>
    `<option value="${o}"${o === selected ? ' selected' : ''}>${o}</option>`
  ).join('');
}

function cb(id: string, value: string, label: string): string {
  return `<label class="cb"><input type="checkbox" id="${id}"${value === 'true' ? ' checked' : ''}>${label}</label>`;
}

function tf(id: string, value: string, label: string, placeholder = ''): string {
  const ph = placeholder ? ` placeholder="${esc(placeholder)}"` : '';
  return `<div class="field"><div class="field-label">${label}</div><input type="text" id="${id}" value="${esc(value)}"${ph}></div>`;
}
