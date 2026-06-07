import * as vscode from 'vscode';
import { exec } from 'child_process';

export interface XSharpProjectTemplate {
  name: string;
  shortName: string;
  tags: string;
}

/**
 * Discovers the X# project templates installed alongside the XSharp SDK by
 * shelling out to `dotnet new list`. Forces English output via
 * DOTNET_CLI_UI_LANGUAGE so the table can be parsed regardless of the user's
 * locale (the default French-locale headers would otherwise break parsing).
 */
export function listXSharpProjectTemplates(): Promise<XSharpProjectTemplate[]> {
  return new Promise(resolve => {
    exec(
      'dotnet new list --type project -lang "X#"',
      { env: { ...process.env, DOTNET_CLI_UI_LANGUAGE: 'en' }, timeout: 30000 },
      (error, stdout) => {
        if (error) {
          vscode.window.showErrorMessage(
            'Unable to list XSharp project templates. Make sure the .NET SDK is installed and on PATH.'
          );
          resolve([]);
          return;
        }
        resolve(parseTemplateTable(stdout));
      }
    );
  });
}

/**
 * Parses `dotnet new list`'s fixed-width table. Column boundaries are derived
 * from the dashed separator row rather than the (localizable) header text, so
 * this keeps working across SDK versions and locales.
 */
function parseTemplateTable(output: string): XSharpProjectTemplate[] {
  const lines = output.split(/\r?\n/);
  const separatorIndex = lines.findIndex(line => /^-+(\s+-+)+\s*$/.test(line));
  if (separatorIndex < 0) {
    return [];
  }

  const columnStarts: number[] = [];
  const dashRun = /-+/g;
  let match: RegExpExecArray | null;
  while ((match = dashRun.exec(lines[separatorIndex])) !== null) {
    columnStarts.push(match.index);
  }
  if (columnStarts.length < 4) {
    return [];
  }
  const [nameStart, shortNameStart, , tagsStart] = columnStarts;

  const templates: XSharpProjectTemplate[] = [];
  for (const line of lines.slice(separatorIndex + 1)) {
    if (!line.trim()) {
      continue;
    }
    const name = line.slice(nameStart, shortNameStart).trim();
    const shortName = line.slice(shortNameStart, tagsStart).split(/\s{2,}/)[0].trim();
    const tags = line.slice(tagsStart).trim();
    if (name && shortName) {
      templates.push({ name, shortName, tags });
    }
  }
  return templates;
}
