"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const antlr4ts_1 = require("antlr4ts");
const bsvLexer_1 = require("../src/bsvjs/bsvLexer");
const bsvParser_1 = require("../src/bsvjs/bsvParser");
const testFolder = 'syntaxes/bsc-lib';
const fs = require("fs");
const path = require("path");
fs.readdir(testFolder, (err, files) => {
    if (err)
        throw err;
    files.forEach(file => {
        console.log(file);
        var data = fs.readFileSync(path.join(testFolder, file));
        if (err)
            throw err;
        const chars = new antlr4ts_1.ANTLRInputStream(data.toString());
        const lexer = new bsvLexer_1.bsvLexer(chars);
        const tokens = new antlr4ts_1.CommonTokenStream(lexer);
        const parser = new bsvParser_1.bsvParser(tokens);
        class MyBsvListener {
        }
        class MyBsvErrorListener {
            syntaxError(recognizer, offendingSymbol, line, charPositionInLine, msg, e) {
                console.error(msg);
                debugger;
            }
        }
        var listener = new MyBsvListener();
        var errorListener = new MyBsvErrorListener();
        parser.addParseListener(listener);
        parser.removeErrorListeners();
        parser.addErrorListener(errorListener);
        const tree = parser.top();
    });
});
//# sourceMappingURL=bsv.js.map