# Change Log

All notable changes to the "xsharp-tools" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased]

## [0.5.0] - 2026-05-11

### Added
- Dedicated **XSharp Build** output channel showing full `dotnet build` output
- Keyboard shortcuts: `Ctrl+Shift+B` to build, `Ctrl+F5` to run (when an XSharp file is active)
- Quick-pick project selector when the workspace contains multiple `.xsproj` files
- **Open Folder of Active File** now reveals the file in the OS file explorer instead of replacing the workspace

### Fixed
- `lateBinding` checkbox was never pre-checked in the project configurator (key case mismatch)
- `modernSyntax` was not included in the save payload and was never written to the `.xsproj`
- `initLocals` was never saved to the `.xsproj` due to a key case mismatch
- Reset button in the project configurator was clearing all fields instead of restoring saved values
- Build error parser only recognised `.prg` files; errors in `.xs`, `.ch`, `.prgx`, `.xsc`, `.xsprg` files are now reported

### Changed
- LSP client now checks for `XSharpLanguageServer.exe` at startup and shows a clear warning if it is missing, instead of failing silently
- Build and Run commands now share a common helper (`prepareProjectCwd`) to eliminate duplicated logic
- `dotnet build` invocations now have a 60-second timeout to prevent silent hangs
- `launch.json` is no longer overwritten when it already exists
- LSP file watcher now covers all XSharp file extensions (`.xs`, `.ch`, `.xsc`, `.xsprg`)
- WebView panels (Settings, Project Configurator) now include a Content-Security-Policy header and use a per-session nonce for inline scripts
- Project values injected into WebView HTML are now serialized with `JSON.stringify` to prevent XSS

## [0.4.9]
- Add `.xsproj` as an XML file
- Moved the Menu items to a submenu

## [0.4.0]
- Add LSP (Language Server Protocol) Client/Server for the X# language

## [0.3.0]
- Add settings for the X# Project

## [0.2.0]
- Add settings for the extension

## [0.1.0]
- Initial release
