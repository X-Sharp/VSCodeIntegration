# XSharp Tools README

This is the README for the extension "XSharp Tools".  

The extension and its settings are available via the command palette of Visual Studio Code, or by ***Right-Clicking*** on a **.xsproj** file.  

## Features

- **Create New XSharp Project** wizard scaffolds a new project from the X# `dotnet new`
  templates installed with your XSharp SDK (Console, Class Library, WinForms, WPF, Web API,
  VO/FoxPro/Harbour/Vulcan/XBase++ dialect variants, …). Available from the Command Palette
  or by right-clicking a folder in the Explorer. Opens the new project and launches the
  **Configure XSharp Project** panel automatically on first run.
- Build and run XSharp projects directly from VS Code via **dotnet build** / **dotnet run**.
  Build output appears in the dedicated **XSharp Build** output channel and errors/warnings are reported in the **Problems** panel.
- Keyboard shortcuts: `Ctrl+Shift+B` to build, `Ctrl+F5` to run (active when an XSharp file is open).
- In workspaces with multiple `.xsproj` files, a quick-pick menu lets you choose which project to build.
- Configure project settings via the **Configure XSharp Project** panel, supporting both
  SDK-style and legacy (non-SDK-style) `.xsproj` projects. It exposes:
  - **General** tab: assembly name, target framework (Target Framework Version for legacy
    projects), dialect, output type, resource options.
  - **Language** tab: late binding, named args, unsafe code, nullable, memory variables, namespaces, preprocessor, and more.
  - **Dialect** tab: all VO compatibility flags (VO1–VO17) and dialect-specific flags (FoxPro, XPP).
  - **Build** tab: per-configuration output path, optimize, debug type, treat-warnings-as-errors
    (a code-list selector for SDK-style projects, a checkbox for legacy projects), and other build properties.
  - **Package** tab *(SDK-style projects only)*: NuGet package metadata and assembly info. Hidden for legacy `.xsproj` files.
- **XSharp Tools Settings** panel for controlling the extension and LSP server behaviour (Build & Run, Parser Dialect, Formatting, Indentation, Diagnostics).
- **Open Folder of Active File** reveals the current file in the OS file explorer.

- Starting from Version 0.4.0, the package integrates a basic LSP Client that communicates with the [xsharp-lsp-server](https://github.com/fforay/xsharp-lsp-server). The installer (.vsix) will contain the XSharpLanguageServer.exe. The server is **no longer published as a self-contained EXE** and requires **.NET 10** to be installed on the machine. Put the EXE into the **server** folder before creating the vsix file. If the EXE is missing, the extension will show a warning and continue without IntelliSense.

- **Keyword pair highlighting** — when the cursor is on a structural keyword (`IF`, `FOR`, `WHILE`, `CLASS`, `TRY`, …), the extension highlights all matching pair boundaries (`ELSEIF`/`ELSE`/`ENDIF`, `NEXT`, `ENDDO`, `ENDCLASS`, `CATCH`/`FINALLY`/`ENDTRY`, …) using the `editor.wordHighlightStrongBackground` theme colour.  Identifier occurrences use `editor.wordHighlightBackground`.  The built-in VS Code occurrence highlighter is disabled for XSharp files to prevent interference.

- The extension ships a TextMate grammar (`syntaxes/xsharp.tmLanguage.json`) providing syntax highlighting for all XSharp file types (`.prg`, `.xs`, `.ch`, `.xsc`, `.xsprg`, `.prgx`, `.xh`). Semantic tokens emitted by the LSP server are mapped to TextMate scopes so that any VS Code theme can colour them correctly.

## Requirements

You must have the latest XSharp Language version installed.  
You can get it here : http://www.xsharp.eu  

**.NET 10** must be installed on the machine — the LSP server (`XSharpLanguageServer.exe`) is no longer a self-contained executable and depends on the .NET 10 runtime.

It is good also to install the [X# Lang extension](https://marketplace.visualstudio.com/items?itemName=InfomindsAG.xsharp-lang) in order to have Syntax Highlighting, if you want more options.

## Extension Settings

All settings are available via **XSharp Tools → XSharp Tools Settings** in the context menu, or directly in VS Code settings.

### Build & Run

| Setting | Default | Description |
|---|---|---|
| `xsharp-tools.showErrors` | `true` | Show errors in the Problems panel |
| `xsharp-tools.showWarnings` | `true` | Show warnings in the Problems panel |
| `xsharp-tools.groupByFile` | `true` | Group errors and warnings by file |

### Parser (LSP)

The parser is used for syntax colouring and IntelliSense. When a workspace is opened that contains exactly one `.xsproj` file, the dialect, include paths, and preprocessor symbols are automatically read from the project file and applied to the settings below. If the workspace has multiple `.xsproj` files the settings are left unchanged.

| Setting | Default | Description |
|---|---|---|
| `xsharp.dialect` | `Core` | XSharp dialect (`Core`, `VO`, `Vulcan`, `Harbour`, `FoxPro`, `XPP`, `dBase`) |
| `xsharp.includePaths` | `""` | Semicolon-separated extra `#include` search paths |
| `xsharp.preprocessorSymbols` | `""` | Extra preprocessor symbols (e.g. `DEBUG;MYFLAG`) |

### Formatting (LSP)

| Setting | Default | Description |
|---|---|---|
| `xsharp.keywordCase` | `Upper` | Keyword case applied by the formatter: `Upper`, `Lower`, `Title`, `None` |
| `xsharp.trimTrailingWhitespace` | `true` | Remove trailing whitespace when formatting |
| `xsharp.insertFinalNewline` | `false` | Ensure file ends with a newline when formatting |

### Indentation (LSP)

| Setting | Default | Description |
|---|---|---|
| `xsharp.indentNamespace` | `false` | Indent entities inside a `NAMESPACE` block |
| `xsharp.indentEntityContent` | `true` | Indent multiline members inside `CLASS` / `STRUCTURE` |
| `xsharp.indentFieldContent` | `true` | Indent single-line fields inside `CLASS` / `STRUCTURE` |
| `xsharp.indentBlockContent` | `true` | Indent statements inside `FUNCTION` / `METHOD` body |
| `xsharp.indentCaseLabel` | `false` | Indent `CASE` / `OTHERWISE` labels inside `DO CASE` / `SWITCH` |
| `xsharp.indentCaseContent` | `true` | Indent statements inside each `CASE` / `OTHERWISE` branch |
| `xsharp.indentMultiLines` | `true` | Indent continuation lines in multi-line statements |
| `xsharp.indentPreprocessorLines` | `false` | Indent preprocessor directives with surrounding code |

### Diagnostics (LSP)

| Setting | Default | Description |
|---|---|---|
| `xsharp.hoverKeywords` | `true` | Show a one-line tooltip when hovering over built-in keywords (IF, RETURN, CLASS, …). Set to `false` if you find keyword hover distracting. |
| `xsharp.semanticDiagnostics` | `false` | Enable extra semantic diagnostics (XS0001, XS0003). May produce false positives. |
| `xsharp.warnOnUndefinedCalls` | `false` | Warn on calls to unknown functions (XS0002). Requires semantic diagnostics. |

## LSP Output Channels

The language server log is available directly in VS Code's **Output** panel:

- **XSharp Language Server** — receives all `window/logMessage` notifications sent by the server (info, warnings, errors). The panel opens automatically only on errors.
- **XSharp Language Server (Trace)** — receives LSP protocol-level trace messages. Controlled by the `xsharp.trace.server` setting (`"off"` / `"messages"` / `"verbose"`).

If you need deeper diagnostics, the Language Server will also write a log file when the environment variable **XSHARPLSP_LOG_PATH** is set to an existing folder — you will find a **XSharpLSPYYYYMMDD.log** file there.

## Installation

Go to the [Releases](https://github.com/fforay/xsharp-tools/releases) and get the lastest **.vsix** file.  
Adapt the procedure with the current vsix filename.

From the CLI, run:   
code --install-extension xsharp-tools-0.1.0.vsix

From VSCode
- Press Ctrl+Shift+P
- Type : Extensions: Install from VSIX
- Select the .vsix file in the explorer

## Compile & Package the extension

The LSP server must be built (no longer self-contained — requires .NET 10 at runtime) and put into the **server** folder before creating the vsix file

Compile with :  

    npm run compile

Create .vsix with :  

    npx @vscode/vsce package


## Known Issues

None at this time. Please report issues on the [GitHub repository](https://github.com/X-Sharp/VSCodeIntegration/issues).

## Release Notes

### 0.7.0
- **Keyword pair highlighting**: structural keywords and their matching boundaries (`IF`/`ENDIF`, `FOR`/`NEXT`, `CLASS`/`ENDCLASS`, …) are highlighted with a persistent strong decoration when the cursor is on any boundary keyword
- **`xsharp.hoverKeywords` setting**: disable built-in keyword hover tooltips (IF, RETURN, CLASS, …) while keeping symbol and local-variable hover
- Built-in VS Code occurrence highlighter disabled for XSharp files to prevent interference with custom highlights

### 0.6.6
- **Auto-sync parser settings from `.xsproj`**: dialect, include paths, and preprocessor symbols are automatically read from the project file when opening a single-project workspace
- **Settings panel dialect fix**: returning to the XSharp Settings panel after a tab switch now shows the correct (saved) dialect value
- **LSP output in the Output panel**: language server logs appear in the **XSharp Language Server** channel; protocol traces in **XSharp Language Server (Trace)**

### 0.6.5
- **Create New XSharp Project** wizard: scaffold Console, Class Library, WinForms, WPF, Web API, and dialect-specific projects from the Command Palette or Explorer context menu
- **Configure XSharp Project** now works with legacy (non-SDK-style) `.xsproj` files — full read/write support, adapts General/Build tabs to the project type, Package tab remains hidden
- Saving project settings preserves XML comments and element order in the `.xsproj` file
- Fixed FoxPro `&&` line-comment tokenisation in the TextMate grammar (synced with LSP server)

### 0.6.0
- Project Configurator expanded with full Language, Dialect, Build, and Package tabs
- Package tab hidden for legacy (non-SDK-style) `.xsproj` files
- Settings panel expanded with Formatting, Indentation, and Diagnostics sections
- `.xh` header files now watched by the LSP client

### 0.5.0
- TextMate grammar for syntax highlighting; semantic token scope mappings
- Dedicated **XSharp Build** output channel
- Keyboard shortcuts: `Ctrl+Shift+B` to build, `Ctrl+F5` to run
- Quick-pick project selector for multi-project workspaces
- Various bug fixes (key case mismatches, error parser, reset button, CSP headers)

### 0.4.9
- Added `.xsproj` syntax highlighting as XML
- Moved context menu items into an **XSharp Tools** submenu

### 0.4.0
- Added LSP (Language Server Protocol) client — connects to `XSharpLanguageServer.exe` for IntelliSense

### 0.3.0
- Added project configurator panel for `.xsproj` settings

### 0.2.0
- Added extension settings (show errors, show warnings, group by file)

### 0.1.0
- Initial release


**Enjoy!**
