# XSharp Tools README

This is the README for the extension "XSharp Tools".  

The extension and its settings are available via the command palette of Visual Studio Code, or by ***Right-Clicking*** on a **.xsproj** file.  

## Features

- Build and run XSharp projects directly from VS Code via **dotnet build** / **dotnet run**.
  Build output appears in the dedicated **XSharp Build** output channel and errors/warnings are reported in the **Problems** panel.
- Keyboard shortcuts: `Ctrl+Shift+B` to build, `Ctrl+F5` to run (active when an XSharp file is open).
- In workspaces with multiple `.xsproj` files, a quick-pick menu lets you choose which project to build.
- Configure project settings (dialect, output type, compiler flags) via the **Configure XSharp Project** panel.
- **Open Folder of Active File** reveals the current file in the OS file explorer.

- Starting from Version 0.4.0, the package integrates a basic LSP Client that communicates with the [xsharp-lsp-server](https://github.com/fforay/xsharp-lsp-server). The installer (.vsix) will contain the XSharpLanguageServer.exe. The server must be **published** as a self-contained EXE and put into the **server** folder before creating the vsix file. If the EXE is missing, the extension will show a warning and continue without IntelliSense.

## Requirements

You must have the latest XSharp Language version installed.  
You can get it here : http://www.xsharp.eu  

It is good also to install the [X# Lang extension](https://marketplace.visualstudio.com/items?itemName=InfomindsAG.xsharp-lang) in order to have Syntax Highlighting, if you want more options.

## Extension Settings

| Setting | Default | Description |
|---|---|---|
| `xsharp-tools.showErrors` | `true` | Show errors in the Problems panel |
| `xsharp-tools.showWarnings` | `true` | Show warnings in the Problems panel |
| `xsharp-tools.groupByFile` | `true` | Group errors and warnings by file |

Settings can also be changed via **XSharp Tools → XSharp Tools Settings** in the context menu.

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
