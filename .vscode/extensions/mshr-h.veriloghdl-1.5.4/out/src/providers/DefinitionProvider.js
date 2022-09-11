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
exports.BsvDefinitionProvider = exports.VerilogDefinitionProvider = void 0;
const vscode_1 = require("vscode");
const BsvProvider_1 = require("../BsvProvider");
const ctags_1 = require("../ctags");
class VerilogDefinitionProvider {
    constructor(logger) {
        this.logger = logger;
    }
    provideDefinition(document, position, token) {
        return __awaiter(this, void 0, void 0, function* () {
            this.logger.log('Definitions Requested: ' + document.uri);
            // get word start and end
            let textRange = document.getWordRangeAtPosition(position);
            if (!textRange || textRange.isEmpty)
                return;
            // hover word
            let targetText = document.getText(textRange);
            let symbols = yield ctags_1.CtagsManager.getSymbols(document);
            let matchingSymbols = [];
            let definitions = [];
            // find all matching symbols
            for (let i of symbols) {
                if (i.name === targetText) {
                    matchingSymbols.push(i);
                }
            }
            for (let i of matchingSymbols) {
                definitions.push({
                    targetUri: document.uri,
                    targetRange: new vscode_1.Range(i.startPosition, new vscode_1.Position(i.startPosition.line, Number.MAX_VALUE)),
                    targetSelectionRange: new vscode_1.Range(i.startPosition, i.endPosition),
                });
            }
            this.logger.log(definitions.length + ' definitions returned');
            return definitions;
        });
    }
}
exports.VerilogDefinitionProvider = VerilogDefinitionProvider;
class BsvDefinitionProvider {
    provideDefinition(document, position, token) {
        const provider = BsvProvider_1.BsvInfoProviderManger.getInstance().getProvider();
        return provider.provideDefinition(document, position);
    }
}
exports.BsvDefinitionProvider = BsvDefinitionProvider;
//# sourceMappingURL=DefinitionProvider.js.map