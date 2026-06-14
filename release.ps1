# Bump patch version, compile, and package the VS Code extension.
# Usage: .\release.ps1
# Result: xsharp-tools-<new-version>.vsix in the current directory.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Increment patch version in package.json (no git commit/tag).
npm version patch --no-git-tag-version

# Read the new version for the log message.
$version = (Get-Content package.json | ConvertFrom-Json).version
Write-Host "Building version $version ..." -ForegroundColor Cyan

# Compile (type-check + lint + esbuild production bundle).
npm run compile

# Package into a .vsix file.
npx @vscode/vsce package

Write-Host "Done: xsharp-tools-$version.vsix" -ForegroundColor Green
