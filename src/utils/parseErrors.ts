import * as vscode from 'vscode';
import * as path from 'path';

import { diagnosticCollection } from '../extension';


export function parseBuildErrors(output: string) {
  const diagnosticsMap = new Map<string, vscode.Diagnostic[]>();
  const seenErrors = new Set<string>();
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? '';
  const config = vscode.workspace.getConfiguration('xsharp-tools');

  const showErrors = config.get<boolean>('showErrors', true);
  const showWarnings = config.get<boolean>('showWarnings', true);
  const groupByFile = config.get<boolean>('groupByFile', true);

  const regex = /(.*\.(?:prg|prgx|xs|xsc|xsprg|ch))\((\d+),(\d+)\):\s*(error|warning)\s*(\w+):\s*(.*)/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(output)) !== null) {
    const [_, filePathRaw, lineStr, colStr, severityStr, code, message] = match;

    const line = parseInt(lineStr, 10) - 1;
    const col = parseInt(colStr, 10) - 1;

    const resolvedPath = path.resolve(workspaceRoot, filePathRaw);
    const normalizedPath = path.normalize(resolvedPath);

    // Skip invalid paths
    if (!path.isAbsolute(normalizedPath)) {
      console.warn("Invalid path:", normalizedPath);
      continue;
    }

    const errorKey = `${normalizedPath}:${line}:${col}:${code}:${message}`;

    const severity = severityStr === 'error'
      ? vscode.DiagnosticSeverity.Error
      : vscode.DiagnosticSeverity.Warning;

    if ((severity === vscode.DiagnosticSeverity.Error && !showErrors) ||
        (severity === vscode.DiagnosticSeverity.Warning && !showWarnings)) {
      continue;
    }

    if (seenErrors.has(errorKey)) {
      continue;
    }
    seenErrors.add(errorKey);

    const range = new vscode.Range(line, col, line, col + 1);
    const diagnostic = new vscode.Diagnostic(range, `${code}: ${message}`, severity);

    if (!diagnosticsMap.has(normalizedPath)) {
      diagnosticsMap.set(normalizedPath, []);
    }
    diagnosticsMap.get(normalizedPath)!.push(diagnostic);
  }

  // Nothing to report → clear and exit safely
  if (diagnosticsMap.size === 0) {
    diagnosticCollection.clear();
    return;
  }

  if (groupByFile) {
    diagnosticsMap.forEach((diags, file) => {
      diagnosticCollection.set(vscode.Uri.file(file), diags);
    });
  } else {
    const allDiagnostics = [...diagnosticsMap.values()].flat();
    const firstFile = Array.from(diagnosticsMap.keys())[0];
    diagnosticCollection.set(vscode.Uri.file(firstFile), allDiagnostics);
  }
}