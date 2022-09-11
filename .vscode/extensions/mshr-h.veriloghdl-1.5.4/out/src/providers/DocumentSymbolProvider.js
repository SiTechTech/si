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
exports.BsvDocumentSymbolProvider = exports.VerilogDocumentSymbolProvider = void 0;
const vscode_1 = require("vscode");
const BsvProvider_1 = require("../BsvProvider");
const ctags_1 = require("../ctags");
const Logger_1 = require("../Logger");
class VerilogDocumentSymbolProvider {
    constructor(logger) {
        this.docSymbols = [];
        this.logger = logger;
    }
    provideDocumentSymbols(document, token) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log('Symbols Requested: ' + document.uri);
            console.log('symbol provider');
            let symbols = yield ctags_1.CtagsManager.getSymbols(document);
            console.log(symbols);
            this.docSymbols = this.buildDocumentSymbolList(symbols);
            this.logger.log(this.docSymbols.length + ' top-level symbols returned', this.docSymbols.length > 0 ? Logger_1.Log_Severity.Info : Logger_1.Log_Severity.Warn);
            return this.docSymbols;
        });
    }
    isContainer(type) {
        switch (type) {
            case vscode_1.SymbolKind.Array:
            case vscode_1.SymbolKind.Boolean:
            case vscode_1.SymbolKind.Constant:
            case vscode_1.SymbolKind.EnumMember:
            case vscode_1.SymbolKind.Event:
            case vscode_1.SymbolKind.Field:
            case vscode_1.SymbolKind.Key:
            case vscode_1.SymbolKind.Null:
            case vscode_1.SymbolKind.Number:
            case vscode_1.SymbolKind.Object:
            case vscode_1.SymbolKind.Property:
            case vscode_1.SymbolKind.String:
            case vscode_1.SymbolKind.TypeParameter:
            case vscode_1.SymbolKind.Variable:
                return false;
            case vscode_1.SymbolKind.Class:
            case vscode_1.SymbolKind.Constructor:
            case vscode_1.SymbolKind.Enum:
            case vscode_1.SymbolKind.File:
            case vscode_1.SymbolKind.Function:
            case vscode_1.SymbolKind.Interface:
            case vscode_1.SymbolKind.Method:
            case vscode_1.SymbolKind.Module:
            case vscode_1.SymbolKind.Namespace:
            case vscode_1.SymbolKind.Package:
            case vscode_1.SymbolKind.Struct:
                return true;
        }
    }
    // find the appropriate container RECURSIVELY and add to its childrem
    // return true: if done
    // return false: if container not found
    findContainer(con, sym) {
        let res = false;
        for (let i of con.children) {
            if (this.isContainer(i.kind) && i.range.contains(sym.range)) {
                res = this.findContainer(i, sym);
                if (res)
                    return true;
            }
        }
        if (!res) {
            con.children.push(sym);
            return true;
        }
    }
    // Build heiarchial DocumentSymbol[] from linear symbolsList[] using start and end position
    // TODO: Use parentscope/parenttype of symbol to construct heirarchial DocumentSymbol []
    buildDocumentSymbolList(symbolsList) {
        let list = [];
        symbolsList = symbolsList.sort((a, b) => {
            if (a.startPosition.isBefore(b.startPosition))
                return -1;
            if (a.startPosition.isAfter(b.startPosition))
                return 1;
            return 0;
        });
        // Add each of the symbols in order
        for (let i of symbolsList) {
            let sym = i.getDocumentSymbol();
            // if no top level elements present
            if (list.length === 0) {
                list.push(sym);
                continue;
            }
            else {
                // find a parent among the top level element
                let done;
                for (let j of list) {
                    if (this.isContainer(j.kind) &&
                        j.range.contains(sym.range)) {
                        this.findContainer(j, sym);
                        done = true;
                        break;
                    }
                }
                // add a new top level element
                if (!done)
                    list.push(sym);
            }
        }
        return list;
    }
}
exports.VerilogDocumentSymbolProvider = VerilogDocumentSymbolProvider;
class BsvDocumentSymbolProvider {
    constructor(logger) {
        this.logger = logger;
    }
    provideDocumentSymbols(document, token) {
        // return new Promise((resolve)=>{
        //     const provider = BsvInfoProviderManger.getInstance().getProvider();
        //     var info = provider.getSymbol(document);
        //     resolve(info);
        // })
        const provider = BsvProvider_1.BsvInfoProviderManger.getInstance().getProvider();
        var info = provider.getSymbol(document);
        return info;
    }
}
exports.BsvDocumentSymbolProvider = BsvDocumentSymbolProvider;
//# sourceMappingURL=DocumentSymbolProvider.js.map