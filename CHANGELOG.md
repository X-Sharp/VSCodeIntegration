# Change Log

All notable changes to the "xsharp-tools" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.6.5] - 2026-06-08

### Added
- **New "Create New XSharp Project" command** scaffolds a project from the X# `dotnet new` templates installed with the XSharp SDK (Console, Class Library, WinForms, WPF, Web API, and dialect-specific variants for VO/FoxPro/Harbour/Vulcan/XBase++). Available from the Command Palette or by right-clicking a folder in the Explorer; opens the new project and launches **Configure XSharp Project** automatically on first run
- **Configure XSharp Project now opens for legacy (non-SDK-style) `.xsproj` projects**, not just SDK-style ones, with full read/write support for non-SDK build properties
- General tab adapts to the project style: SDK-style projects show **Target Framework** (`TargetFramework`/`TargetFrameworks`), legacy projects show **Target Framework Version** (`TargetFrameworkVersion`)
- Build tab's "Treat warnings as errors" adapts to the project style: SDK-style projects keep the None/All/Specific code-list selector (`WarningsAsErrors`), legacy projects get a simple checkbox (`TreatWarningsAsErrors`)
- Package tab remains hidden for legacy projects (NuGet/assembly metadata doesn't apply to them)

### Fixed
- Saving project settings no longer drops XML comments or reorders elements in the `.xsproj` file — the configurator now parses and rewrites the XML with `fast-xml-parser`'s order-preserving mode, so comments and formatting survive a load/save round-trip
- `&&` is no longer tokenised as a bitwise-AND operator in FoxPro dialect files — the TextMate grammar now correctly treats it as the FoxPro line-comment introducer (synced with LSP server fix for `FOX_AND`/`EXP` tokens)

## [0.6.0] - 2026-06-05

### Added
- Project Configurator now has full **Language**, **Dialect**, and **Package** tabs exposing all major compiler options (late binding, named args, unsafe code, nullable, VO compatibility flags, FoxPro/XPP dialect flags, NuGet package metadata, assembly info, …)
- Project Configurator has a new **Build** tab with per-configuration build settings (output path, optimize, debug type, …)
- **Package tab is hidden for legacy (non-SDK-style) projects** — package properties are not written to the `.xsproj` for legacy projects
- `.xh` header files are now watched by the LSP client (file-change notifications sent to the language server)
- Settings panel has new **Formatting** section: keyword case (`Upper` / `Lower` / `Title` / `None`), trim trailing whitespace, insert final newline
- Settings panel has new **Indentation** section: indent namespace content, entity content, field content, block content, CASE labels, CASE content, continuation lines, preprocessor directives
- Settings panel has new **Diagnostics** section: enable semantic diagnostics, warn on undefined function calls
- All new settings are exposed as `xsharp.*` VS Code workspace settings and forwarded to the LSP server

## [0.5.0] - 2026-05-11

### Added
- TextMate grammar with syntax highlighting for preprocessor directives and operators
- Semantic token scope mappings for `class`, `method`, `property`, `parameter`, `namespace`, `enum`, `enumMember`, `interface`, `struct`, `typeParameter`
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
- `///` doc-comments now use the standard `comment.line.documentation` scope so themes apply doc-comment styling
- Semantic token `comment` scope now covers all comment types; `string` scope covers all string variants
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
