'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.extensionID = exports.ctagsManager = void 0;
const vscode_1 = require("vscode");
// Linters
const LintManager_1 = require("./linter/LintManager");
// ctags
const ctags_1 = require("./ctags");
// Providers
const DocumentSymbolProvider_1 = require("./providers/DocumentSymbolProvider");
const HoverProvider_1 = require("./providers/HoverProvider");
const DefinitionProvider_1 = require("./providers/DefinitionProvider");
const CompletionItemProvider_1 = require("./providers/CompletionItemProvider");
const BsvProvider_1 = require("./BsvProvider");
// Commands
const ModuleInstantiation = require("./commands/ModuleInstantiation");
// Language Server
const node_1 = require("vscode-languageclient/node");
// Logger
const Logger_1 = require("./Logger");
let lintManager;
let logger = new Logger_1.Logger();
exports.ctagsManager = new ctags_1.CtagsManager(logger);
exports.extensionID = 'mshr-h.veriloghdl';
let client;
function activate(context) {
    console.log(exports.extensionID + ' is now active!');
    BsvProvider_1.BsvInfoProviderManger.getInstance().onWorkspace();
    vscode_1.workspace.onDidChangeWorkspaceFolders((e) => {
        BsvProvider_1.BsvInfoProviderManger.getInstance().onWorkspace();
    });
    // document selector
    let systemverilogSelector = {
        scheme: 'file',
        language: 'systemverilog',
    };
    let verilogSelector = {
        scheme: 'file',
        language: 'verilog',
    };
    let bsvSelector = { scheme: 'file', language: 'bsv' };
    // Check if the Extension was updated recently
    checkIfUpdated(context);
    // Configure ctags
    exports.ctagsManager.configure();
    // Configure lint manager
    lintManager = new LintManager_1.default(logger);
    // Configure Document Symbol Provider
    let docProvider = new DocumentSymbolProvider_1.VerilogDocumentSymbolProvider(logger);
    context.subscriptions.push(vscode_1.languages.registerDocumentSymbolProvider(systemverilogSelector, docProvider));
    context.subscriptions.push(vscode_1.languages.registerDocumentSymbolProvider(verilogSelector, docProvider));
    let bsvdocProvider = new DocumentSymbolProvider_1.BsvDocumentSymbolProvider(logger);
    context.subscriptions.push(vscode_1.languages.registerDocumentSymbolProvider(bsvSelector, bsvdocProvider));
    // Configure Completion Item Provider
    // Trigger on ".", "(", "="
    let compItemProvider = new CompletionItemProvider_1.VerilogCompletionItemProvider(logger);
    context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider(verilogSelector, compItemProvider, '.', '(', '='));
    context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider(systemverilogSelector, compItemProvider, '.', '(', '='));
    let bsvcompItemProvider = new CompletionItemProvider_1.BsvCompletionItemProvider(logger);
    context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider(bsvSelector, bsvcompItemProvider, '.', '(', '='));
    // Configure Hover Providers
    let hoverProvider = new HoverProvider_1.VerilogHoverProvider(logger);
    context.subscriptions.push(vscode_1.languages.registerHoverProvider(systemverilogSelector, hoverProvider));
    context.subscriptions.push(vscode_1.languages.registerHoverProvider(verilogSelector, hoverProvider));
    let bsvhoverProvider = new HoverProvider_1.BsvHoverProvider(logger);
    context.subscriptions.push(vscode_1.languages.registerHoverProvider(bsvSelector, bsvhoverProvider));
    // Configure Definition Providers
    let defProvider = new DefinitionProvider_1.VerilogDefinitionProvider(logger);
    context.subscriptions.push(vscode_1.languages.registerDefinitionProvider(systemverilogSelector, defProvider));
    context.subscriptions.push(vscode_1.languages.registerDefinitionProvider(verilogSelector, defProvider));
    let bsvdefProvider = new DefinitionProvider_1.BsvDefinitionProvider();
    context.subscriptions.push(vscode_1.languages.registerDefinitionProvider(bsvSelector, bsvdefProvider));
    // Configure command to instantiate a module
    vscode_1.commands.registerCommand('verilog.instantiateModule', ModuleInstantiation.instantiateModuleInteract);
    // Register command for manual linting
    vscode_1.commands.registerCommand('verilog.lint', lintManager.RunLintTool, lintManager);
    // Configure svls language server
    configLanguageServer();
    logger.log('Activation complete');
}
exports.activate = activate;
function configLanguageServer() {
    let langserver = (vscode_1.workspace.getConfiguration().get('verilog.languageServer', 'none'));
    switch (langserver) {
        case 'svls':
            let serverOptions = {
                run: { command: 'svls' },
                debug: { command: 'svls', args: ['--debug'] },
            };
            let clientOptions = {
                documentSelector: [
                    { scheme: 'file', language: 'systemverilog' },
                ],
            };
            client = new node_1.LanguageClient('svls', 'SystemVerilog language server', serverOptions, clientOptions);
            client.start();
            console.log('Language server svls started.');
            break;
        default:
            console.log('Invalid language server name.');
            client = null;
            break;
    }
}
function checkIfUpdated(context) {
    // Get previous version
    let prevVersion = context.globalState.get('version', '0.0.0');
    let pv = prevVersion.split('.').map(Number);
    // Get current version
    let currVersion = vscode_1.extensions.getExtension(exports.extensionID).packageJSON.version;
    logger.log(exports.extensionID + ' v' + currVersion);
    let cv = currVersion.split('.').map(Number);
    // check if current version > previous version
    for (let i = 0; i < pv.length; i++) {
        if (pv[i] < cv[i]) {
            showUpdatedNotif();
            break;
        }
    }
    // update the value
    context.globalState.update('version', currVersion);
}
function showUpdatedNotif() {
    logger.log('Recently Updated');
    vscode_1.window
        .showInformationMessage('Verilog-HDL/SystemVerilog extension has been updated', 'Open Changelog')
        .then(function (str) {
        if (str === 'Open Changelog') {
            // get path of CHANGELOG.md
            let changelogPath = vscode_1.extensions.getExtension(exports.extensionID).extensionPath +
                '/CHANGELOG.md';
            let path = vscode_1.Uri.file(changelogPath);
            // open
            vscode_1.workspace.openTextDocument(path).then((doc) => {
                vscode_1.window.showTextDocument(doc);
            });
        }
    });
    logger.log('Update notification shown');
}
function deactivate() {
    if (client) {
        return client.stop();
    }
    logger.log('Deactivated');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map