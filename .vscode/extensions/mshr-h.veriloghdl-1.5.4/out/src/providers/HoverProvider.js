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
exports.BsvHoverProvider = exports.VerilogHoverProvider = void 0;
// import * as vscode from 'vscode';
const vscode_1 = require("vscode");
const BsvProvider_1 = require("../BsvProvider");
const ctags_1 = require("../ctags");
const Logger_1 = require("../Logger");
class VerilogHoverProvider {
    constructor(logger) {
        this.logger = logger;
    }
    provideHover(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log('Hover requested');
            // get word start and end
            let textRange = document.getWordRangeAtPosition(position);
            if (!textRange || textRange.isEmpty)
                return;
            // hover word
            let targetText = document.getText(textRange);
            let symbols = yield ctags_1.CtagsManager.getSymbols(document);
            // find symbol
            for (let i of symbols) {
                // returns the first found tag. Disregards others
                // TODO: very basic hover implementation. Can be extended
                if (i.name === targetText) {
                    let codeRange = new vscode_1.Range(i.startPosition, new vscode_1.Position(i.startPosition.line, Number.MAX_VALUE));
                    let code = document.getText(codeRange).trim();
                    let hoverText = new vscode_1.MarkdownString();
                    hoverText.appendCodeblock(code, document.languageId);
                    this.logger.log('Hover object returned');
                    return new vscode_1.Hover(hoverText);
                }
            }
            this.logger.log('Hover object not found', Logger_1.Log_Severity.Warn);
            return;
        });
    }
}
exports.VerilogHoverProvider = VerilogHoverProvider;
class BsvHoverProvider {
    constructor(logger) {
        this.logger = logger;
    }
    provideHover(document, position, token) {
        const provider = BsvProvider_1.BsvInfoProviderManger.getInstance().getProvider();
        var hover = provider.getHover(document, position);
        return hover;
    }
}
exports.BsvHoverProvider = BsvHoverProvider;
//# sourceMappingURL=HoverProvider.js.map