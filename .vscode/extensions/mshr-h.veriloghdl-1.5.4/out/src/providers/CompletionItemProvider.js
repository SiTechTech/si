"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BsvCompletionItemProvider = exports.VerilogCompletionItemProvider = void 0;
const vscode_1 = require("vscode");
const BsvProvider_1 = require("../BsvProvider");
const ctags_1 = require("../ctags");
class VerilogCompletionItemProvider {
    constructor(logger) {
        this.logger = logger;
    }
    //TODO: Better context based completion items
    provideCompletionItems(document, position, token, context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log('Completion items requested');
            let items = [];
            let symbols = yield ctags_1.CtagsManager.getSymbols(document);
            symbols.forEach((symbol) => {
                let newItem = new vscode_1.CompletionItem(symbol.name, this.getCompletionItemKind(symbol.type));
                let codeRange = new vscode_1.Range(symbol.startPosition, new vscode_1.Position(symbol.startPosition.line, Number.MAX_VALUE));
                let code = document.getText(codeRange).trim();
                newItem.detail = symbol.type;
                let doc = '```systemverilog\n' + code + '\n```';
                if (symbol.parentScope !== undefined && symbol.parentScope !== '')
                    doc += '\nHeirarchial Scope: ' + symbol.parentScope;
                newItem.documentation = new vscode_1.MarkdownString(doc);
                items.push(newItem);
            });
            this.logger.log(items.length + ' items requested');
            return items;
        });
    }
    getCompletionItemKind(type) {
        switch (type) {
            case 'constant':
                return vscode_1.CompletionItemKind.Constant;
            case 'event':
                return vscode_1.CompletionItemKind.Event;
            case 'function':
                return vscode_1.CompletionItemKind.Function;
            case 'module':
                return vscode_1.CompletionItemKind.Module;
            case 'net':
                return vscode_1.CompletionItemKind.Variable;
            case 'port':
                return vscode_1.CompletionItemKind.Variable;
            case 'register':
                return vscode_1.CompletionItemKind.Variable;
            case 'task':
                return vscode_1.CompletionItemKind.Function;
            case 'block':
                return vscode_1.CompletionItemKind.Module;
            case 'assert':
                return vscode_1.CompletionItemKind.Variable; // No idea what to use
            case 'class':
                return vscode_1.CompletionItemKind.Class;
            case 'covergroup':
                return vscode_1.CompletionItemKind.Class; // No idea what to use
            case 'enum':
                return vscode_1.CompletionItemKind.Enum;
            case 'interface':
                return vscode_1.CompletionItemKind.Interface;
            case 'modport':
                return vscode_1.CompletionItemKind.Variable; // same as ports
            case 'package':
                return vscode_1.CompletionItemKind.Module;
            case 'program':
                return vscode_1.CompletionItemKind.Module;
            case 'prototype':
                return vscode_1.CompletionItemKind.Function;
            case 'property':
                return vscode_1.CompletionItemKind.Property;
            case 'struct':
                return vscode_1.CompletionItemKind.Struct;
            case 'typedef':
                return vscode_1.CompletionItemKind.TypeParameter;
            default:
                return vscode_1.CompletionItemKind.Variable;
        }
    }
}
exports.VerilogCompletionItemProvider = VerilogCompletionItemProvider;
class BsvCompletionItemProvider {
    constructor(logger) {
        this.logger = logger;
    }
    provideCompletionItems(document, position, token, context) {
        const provider = BsvProvider_1.BsvInfoProviderManger.getInstance().getProvider();
        return provider.lint(document, position);
    }
}
exports.BsvCompletionItemProvider = BsvCompletionItemProvider;
//# sourceMappingURL=CompletionItemProvider.js.map