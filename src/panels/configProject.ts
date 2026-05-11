


export function getConfigProjectHtml(values: Record<string, string>, nonce: string): string {
  const stateJson = JSON.stringify({
    dialect: values.dialect,
    outputType: values.outputType,
    lateBinding: values.lateBinding,
    namedArgs: values.namedArgs,
    unsafeCode: values.unsafeCode,
    caseSensitive: values.caseSensitive,
    initLocals: values.initLocals,
    overflowEx: values.overflowEx,
    zeroBasedArrays: values.zeroBasedArrays,
    enforceSelf: values.enforceSelf,
    allowDot: values.allowDot,
    nullable: values.nullable,
    enforceVirtualOverride: values.enforceVirtualOverride,
    allowOldStyle: values.allowOldStyle,
    modernSyntax: values.modernSyntax,
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
    </head>
    <body>
      <h2>XSharp Project Settings</h2>
      <hr>
      <label>Dialect:</label>
      <select id="dialect">
        ${renderOptions(['Core', 'VO', 'Vulcan', 'FoxPro', 'Harbour', 'XPP'], values.dialect)}
      </select>
      <br>
      <label>Output Type:</label>
      <select id="outputType">
        ${renderOptions(['Exe', 'Library'], values.outputType)}
      </select>
      <hr>
      <h2>Language</h2>
      <label>
        <input type="checkbox" id="lateBinding" ${values.lateBinding === 'true' ? 'checked' : ''}>
        Allow Late Binding
      </label>
      <br>
      <label>
        <input type="checkbox" id="namedArgs" ${values.namedArgs === 'true' ? 'checked' : ''}>
        Allow Named Arguments
      </label>
      <br>
      <label>
        <input type="checkbox" id="unsafeCode" ${values.unsafeCode === 'true' ? 'checked' : ''}>
        Allow Unsafe Code
      </label>
      <br>
      <label>
        <input type="checkbox" id="caseSensitive" ${values.caseSensitive === 'true' ? 'checked' : ''}>
        Case Sensitive
      </label>
      <br>
      <label>
        <input type="checkbox" id="initLocals" ${values.initLocals === 'true' ? 'checked' : ''}>
        Initialize Local Variables
      </label>
      <br>
      <label>
        <input type="checkbox" id="overflowEx" ${values.overflowEx === 'true' ? 'checked' : ''}>
        Overflow Exceptions
      </label>
      <br>
      <label>
        <input type="checkbox" id="zeroBasedArrays" ${values.zeroBasedArrays === 'true' ? 'checked' : ''}>
        Use Zero Based Arrays
      </label>
      <br>
      <label>
        <input type="checkbox" id="enforceSelf" ${values.enforceSelf === 'true' ? 'checked' : ''}>
        Enforce SELF
      </label>
      <br>
      <label>
        <input type="checkbox" id="allowDot" ${values.allowDot === 'true' ? 'checked' : ''}>
        Allow Dot for instance members
      </label>
      <br>
      <label>
        <input type="checkbox" id="nullable" ${values.nullable === 'enable' ? 'checked' : ''}>
        Enable Nullable
      </label>
      <br>
      <label>
        <input type="checkbox" id="enforceVirtualOverride" ${values.enforceVirtualOverride === 'true' ? 'checked' : ''}>
        Enforce VIRTUAL / OVERRIDE
      </label>
      <br>
      <label>
        <input type="checkbox" id="allowOldStyle" ${values.allowOldStyle === 'true' ? 'checked' : ''}>
        Allow Old Style assignments
      </label>
      <br>
      <label>
        <input type="checkbox" id="modernSyntax" ${values.modernSyntax === 'true' ? 'checked' : ''}>
        Modern Syntax
      </label>
      <br>

      <br>
      <button id="reset">Reset</button>
      <button id="save">Save</button>

      <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();
        const state = ${stateJson};
        vscode.setState(state);

        document.getElementById('reset').addEventListener('click', () => {
          document.getElementById('dialect').value = state.dialect;
          document.getElementById('outputType').value = state.outputType;

          document.getElementById('lateBinding').checked = state.lateBinding === 'true';
          document.getElementById('namedArgs').checked = state.namedArgs === 'true';
          document.getElementById('unsafeCode').checked = state.unsafeCode === 'true';
          document.getElementById('caseSensitive').checked = state.caseSensitive === 'true';
          document.getElementById('initLocals').checked = state.initLocals === 'true';
          document.getElementById('overflowEx').checked = state.overflowEx === 'true';
          document.getElementById('zeroBasedArrays').checked = state.zeroBasedArrays === 'true';
          document.getElementById('enforceSelf').checked = state.enforceSelf === 'true';
          document.getElementById('allowDot').checked = state.allowDot === 'true';
          document.getElementById('nullable').checked = state.nullable === 'enable';
          document.getElementById('enforceVirtualOverride').checked = state.enforceVirtualOverride === 'true';
          document.getElementById('allowOldStyle').checked = state.allowOldStyle === 'true';
          document.getElementById('modernSyntax').checked = state.modernSyntax === 'true';
        });

        document.getElementById('save').addEventListener('click', () => {
          const dialect = document.getElementById('dialect').value;
          const outputType = document.getElementById('outputType').value;

          const lateBinding = document.getElementById('lateBinding').checked ? 'true' : 'false';
          const namedArgs = document.getElementById('namedArgs').checked ? 'true' : 'false';
          const unsafeCode = document.getElementById('unsafeCode').checked ? 'true' : 'false';
          const caseSensitive = document.getElementById('caseSensitive').checked ? 'true' : 'false';
          const initLocals = document.getElementById('initLocals').checked ? 'true' : 'false';
          const overflowEx = document.getElementById('overflowEx').checked ? 'true' : 'false';
          const zeroBasedArrays = document.getElementById('zeroBasedArrays').checked ? 'true' : 'false';
          const enforceSelf = document.getElementById('enforceSelf').checked ? 'true' : 'false';
          const allowDot = document.getElementById('allowDot').checked ? 'true' : 'false';
          const nullable = document.getElementById('nullable').checked ? 'enable' : 'disable';
          const enforceVirtualOverride = document.getElementById('enforceVirtualOverride').checked ? 'true' : 'false';
          const allowOldStyle = document.getElementById('allowOldStyle').checked ? 'true' : 'false';
          const modernSyntax = document.getElementById('modernSyntax').checked ? 'true' : 'false';

          vscode.postMessage({
            command: 'saveSettings',
            values: { dialect, outputType,
                lateBinding, namedArgs, unsafeCode, caseSensitive, initLocals, overflowEx,
                zeroBasedArrays, enforceSelf, allowDot, nullable, enforceVirtualOverride,
                allowOldStyle, modernSyntax }
          });
        });
      </script>
    </body>
    </html>
  `;
}

function renderOptions(options: string[], selected: string): string {
  return options.map(opt =>
    `<option value="${opt}"${opt === selected ? ' selected' : ''}>${opt}</option>`
  ).join('\n');
}
