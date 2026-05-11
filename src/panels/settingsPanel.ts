
import * as vscode from 'vscode';

export function getSettingsPanelHtml(config: vscode.WorkspaceConfiguration, nonce: string): string {

  const showErrors = config.get<boolean>('showErrors', true);
  const showWarnings = config.get<boolean>('showWarnings', true);
  const groupByFile = config.get<boolean>('groupByFile', true);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
      <style>
        body { font-family: sans-serif; padding: 20px; }
        h2 { color: #007acc; }
        label { display: block; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h2>XSharp Tools Settings</h2>
      <label>
      <input type="checkbox" id="errors" ${showErrors ? 'checked' : ''}> Show Errors
      </label>
      <label>
      <input type="checkbox" id="warnings" ${showWarnings ? 'checked' : ''}> Show Warnings
      </label>
      <label>
      <input type="checkbox" id="grouping" ${groupByFile ? 'checked' : ''}> Group by file
      </label>

      <script nonce="${nonce}">
        const vscode = acquireVsCodeApi();

        document.querySelectorAll('input[type=checkbox]').forEach(input => {
          input.addEventListener('change', () => {
            vscode.postMessage({
              setting: input.id === 'grouping' ? 'groupByFile' :
                       input.id === 'errors' ? 'showErrors' :
                       input.id === 'warnings' ? 'showWarnings' : '',
              value: input.checked
            });
          });
        });
      </script>
    </body>
    </html>
  `;
}
