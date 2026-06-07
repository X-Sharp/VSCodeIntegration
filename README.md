# XSharp Tools README

This is the README for the extension "XSharp Tools".  

The extension and its settings are available via the command palette of Visual Studio Code, or by ***Right-Clicking*** on a **.xsproj** file.  

## Features

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
- **XSharp Tools Settings** panel for controlling the extension and LSP server behaviour (Build & Run, Parser, Formatting, Indentation, Diagnostics).
- **Open Folder of Active File** reveals the current file in the OS file explorer.

- Starting from Version 0.4.0, the package integrates a basic LSP Client that communicates with the [xsharp-lsp-server](https://github.com/fforay/xsharp-lsp-server). The installer (.vsix) will contain the XSharpLanguageServer.exe. The server must be **published** as a self-contained EXE and put into the **server** folder before creating the vsix file. If the EXE is missing, the extension will show a warning and continue without IntelliSense.

- The extension ships a TextMate grammar (`syntaxes/xsharp.tmLanguage.json`) providing syntax highlighting for all XSharp file types (`.prg`, `.xs`, `.ch`, `.xsc`, `.xsprg`, `.prgx`, `.xh`). Semantic tokens emitted by the LSP server are mapped to TextMate scopes so that any VS Code theme can colour them correctly.

## Requirements

You must have the latest XSharp Language version installed.  
You can get it here : http://www.xsharp.eu  

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
| `xsharp.semanticDiagnostics` | `false` | Enable extra semantic diagnostics (XS0001, XS0003). May produce false positives. |
| `xsharp.warnOnUndefinedCalls` | `false` | Warn on calls to unknown functions (XS0002). Requires semantic diagnostics. |

## Hidden LSP Server settings

If you want to track down what the LSP Server is doing, you can log some of its work.  

The Language Server will search for an Environment Variable called **XSHARPLSP_LOG_PATH**.  
If the var doesn't exist, nothing will be logged.
If the var indicates a folder, you should find a **XSharpLSPYYYYMMDD.log** file in that folder. It will contains some informations about the LSP Server work.

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

The LSP server must be "published" as a self-contained EXE and put into the **server** folder before creating the vsix file

Compile with :  

    npm run compile

Create .vsix with :  

    npx @vscode/vsce package


## Known Issues

None at this time. Please report issues on the [GitHub repository](https://github.com/X-Sharp/VSCodeIntegration/issues).

## Release Notes

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
