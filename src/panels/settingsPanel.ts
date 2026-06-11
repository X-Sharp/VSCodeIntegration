import * as vscode from 'vscode';

// ── Type helpers ──────────────────────────────────────────────────────────────

interface PanelConfig {
    tools: vscode.WorkspaceConfiguration;
    lsp:   vscode.WorkspaceConfiguration;
}

// ── HTML helpers ──────────────────────────────────────────────────────────────

function checkbox(id: string, label: string, checked: boolean, description?: string): string {
    return `
        <div class="setting">
          <label>
            <input type="checkbox" id="${id}" ${checked ? 'checked' : ''}>
            <span class="label-text">${label}</span>
          </label>
          ${description ? `<p class="description">${description}</p>` : ''}
        </div>`;
}

function select(id: string, label: string, options: string[], value: string, description?: string): string {
    const opts = options.map(o =>
        `<option value="${o}" ${o === value ? 'selected' : ''}>${o}</option>`
    ).join('');
    return `
        <div class="setting">
          <label class="select-label">
            <span class="label-text">${label}</span>
            <select id="${id}">${opts}</select>
          </label>
          ${description ? `<p class="description">${description}</p>` : ''}
        </div>`;
}

function textInput(id: string, label: string, value: string, placeholder: string, description?: string): string {
    return `
        <div class="setting">
          <label class="text-label">
            <span class="label-text">${label}</span>
            <input type="text" id="${id}" value="${escapeHtml(value)}" placeholder="${placeholder}">
          </label>
          ${description ? `<p class="description">${description}</p>` : ''}
        </div>`;
}

function section(title: string, content: string): string {
    return `<section><h3>${title}</h3>${content}</section>`;
}

function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Main HTML builder ─────────────────────────────────────────────────────────

export function getSettingsPanelHtml(cfg: PanelConfig, nonce: string): string {

    // xsharp-tools settings
    const showErrors  = cfg.tools.get<boolean>('showErrors',  true);
    const showWarnings = cfg.tools.get<boolean>('showWarnings', true);
    const groupByFile = cfg.tools.get<boolean>('groupByFile', true);

    // xsharp LSP — Parser
    const dialect    = cfg.lsp.get<string>('dialect',    'Core');
    const includes   = cfg.lsp.get<string>('includePaths', '');
    const ppSymbols  = cfg.lsp.get<string>('preprocessorSymbols', '');

    // xsharp LSP — Formatting
    const kwCase     = cfg.lsp.get<string>('keywordCase', 'Upper');
    const trimWS     = cfg.lsp.get<boolean>('trimTrailingWhitespace', true);
    const finalNL    = cfg.lsp.get<boolean>('insertFinalNewline', false);

    // xsharp LSP — Indentation
    const indNS      = cfg.lsp.get<boolean>('indentNamespace',         false);
    const indEntity  = cfg.lsp.get<boolean>('indentEntityContent',     true);
    const indField   = cfg.lsp.get<boolean>('indentFieldContent',      true);
    const indBlock   = cfg.lsp.get<boolean>('indentBlockContent',      true);
    const indCase    = cfg.lsp.get<boolean>('indentCaseLabel',         false);
    const indCaseCnt = cfg.lsp.get<boolean>('indentCaseContent',       true);
    const indMulti   = cfg.lsp.get<boolean>('indentMultiLines',        true);
    const indPP      = cfg.lsp.get<boolean>('indentPreprocessorLines', false);

    // xsharp LSP — Diagnostics
    const semDiag    = cfg.lsp.get<boolean>('semanticDiagnostics',   false);
    const warnUndef  = cfg.lsp.get<boolean>('warnOnUndefinedCalls',  false);
    const hoverKw    = cfg.lsp.get<boolean>('hoverKeywords',         true);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
        content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body   { font-family: var(--vscode-font-family, sans-serif);
             font-size: var(--vscode-font-size, 13px);
             color: var(--vscode-foreground);
             background: var(--vscode-editor-background);
             padding: 20px 24px; max-width: 720px; }
    h2     { color: var(--vscode-textLink-activeForeground, #007acc);
             border-bottom: 1px solid var(--vscode-widget-border, #444);
             padding-bottom: 6px; margin-bottom: 16px; }
    h3     { color: var(--vscode-foreground); font-size: 1em; font-weight: 700;
             margin: 20px 0 8px; border-left: 3px solid var(--vscode-textLink-activeForeground, #007acc);
             padding-left: 8px; }
    section { background: var(--vscode-editorWidget-background, #252526);
              border: 1px solid var(--vscode-widget-border, #444);
              border-radius: 4px; padding: 12px 16px; margin-bottom: 16px; }
    .setting { margin: 8px 0; }
    label   { display: flex; align-items: center; gap: 8px; cursor: pointer; }
    label.select-label, label.text-label { flex-direction: column; align-items: flex-start; gap: 4px; }
    .label-text { font-weight: 500; }
    input[type=checkbox] { width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; }
    select, input[type=text]
            { background: var(--vscode-input-background, #3c3c3c);
              color: var(--vscode-input-foreground);
              border: 1px solid var(--vscode-input-border, #555);
              border-radius: 3px; padding: 4px 8px;
              font-family: inherit; font-size: inherit; width: 100%; max-width: 320px; }
    .description { margin: 2px 0 0 24px; font-size: 0.88em;
                   color: var(--vscode-descriptionForeground, #999); }
  </style>
</head>
<body>
  <h2>XSharp Settings</h2>

  ${section('Build &amp; Run', `
      ${checkbox('showErrors',  'Show Errors in Problems panel',   showErrors!)}
      ${checkbox('showWarnings','Show Warnings in Problems panel', showWarnings!)}
      ${checkbox('groupByFile', 'Group diagnostics by file',       groupByFile!)}
  `)}

  ${section('Parser', `
      ${select('dialect', 'Dialect',
          ['Core','VO','Vulcan','Harbour','FoxPro','XPP','dBase'], dialect!,
          'XSharp dialect used when parsing source files.')}
      ${textInput('includePaths', 'Include Paths', includes!, 'C:\\MyApp\\Include;C:\\XSharp\\Include',
          'Semicolon-separated list of extra directories to search for #include files.')}
      ${textInput('preprocessorSymbols', 'Preprocessor Symbols', ppSymbols!, 'DEBUG;MYFLAG',
          'Extra preprocessor symbols to define, separated by semicolons.')}
  `)}

  ${section('Formatting', `
      ${select('keywordCase', 'Keyword Case',
          ['Upper','Lower','Title','None'], kwCase!,
          'Case applied to XSharp keywords by the formatter and "Fix all keyword casing" action.')}
      ${checkbox('trimTrailingWhitespace', 'Trim trailing whitespace', trimWS!,
          'Remove trailing whitespace from each line when formatting.')}
      ${checkbox('insertFinalNewline', 'Insert final newline', finalNL!,
          'Ensure the file ends with a newline character when formatting.')}
  `)}

  ${section('Indentation', `
      ${checkbox('indentNamespace',    'Indent entities inside NAMESPACE',                   indNS!,
          'Indent CLASS, FUNCTION, etc. declared inside a NAMESPACE block.')}
      ${checkbox('indentEntityContent','Indent multiline members inside CLASS / STRUCTURE',  indEntity!,
          'Indent METHOD, PROPERTY, and other multiline declarations inside a type body.')}
      ${checkbox('indentFieldContent', 'Indent single-line fields inside CLASS / STRUCTURE', indField!,
          'Indent INSTANCE variables, single-line PROPERTYs, and similar declarations.')}
      ${checkbox('indentBlockContent', 'Indent statements inside FUNCTION / METHOD body',    indBlock!,
          'Indent the code body of FUNCTION, PROCEDURE, METHOD, ACCESS, ASSIGN, etc.')}
      ${checkbox('indentCaseLabel',    'Indent CASE / OTHERWISE labels',                     indCase!,
          'When checked, CASE and OTHERWISE are indented one level inside DO CASE / SWITCH. When unchecked (default) they align with the opener.')}
      ${checkbox('indentCaseContent',  'Indent statements inside CASE / OTHERWISE',          indCaseCnt!,
          'Indent the code inside each CASE or OTHERWISE branch.')}
      ${checkbox('indentMultiLines',   'Indent continuation lines',                          indMulti!,
          'Indent lines that continue a multi-line statement.')}
      ${checkbox('indentPreprocessorLines', 'Indent preprocessor directives',               indPP!,
          'Indent #region, #ifdef, #endif, and similar directives with the surrounding code.')}
  `)}

  ${section('Diagnostics', `
      ${checkbox('semanticDiagnostics', 'Enable semantic diagnostics',       semDiag!,
          'Enable extra diagnostics: wrong argument count (XS0001), unknown LOCAL type (XS0003). May produce false positives.')}
      ${checkbox('warnOnUndefinedCalls','Warn on undefined function calls',  warnUndef!,
          'Flag calls to functions not found in the workspace or referenced assemblies (XS0002). Requires Semantic Diagnostics. High false-positive risk.')}
      ${checkbox('hoverKeywords', 'Show hover tooltip for built-in keywords', hoverKw!,
          'Show a one-line tooltip when hovering over built-in keywords (IF, RETURN, CLASS, …). Disable if you find keyword hover distracting.')}
  `)}

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    // Checkboxes — post { ns, setting, value }
    document.querySelectorAll('input[type=checkbox]').forEach(el => {
      el.addEventListener('change', () => {
        const id = el.id;
        const toolsSettings = ['showErrors','showWarnings','groupByFile'];
        vscode.postMessage({
          ns:      toolsSettings.includes(id) ? 'tools' : 'lsp',
          setting: id,
          type:    'boolean',
          value:   el.checked
        });
      });
    });

    // Selects
    document.querySelectorAll('select').forEach(el => {
      el.addEventListener('change', () => {
        vscode.postMessage({ ns: 'lsp', setting: el.id, type: 'string', value: el.value });
      });
    });

    // Text inputs (debounced 600 ms)
    document.querySelectorAll('input[type=text]').forEach(el => {
      let timer;
      el.addEventListener('input', () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          vscode.postMessage({ ns: 'lsp', setting: el.id, type: 'string', value: el.value });
        }, 600);
      });
    });
  </script>
</body>
</html>`;
}
