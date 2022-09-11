"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseLinter {
    constructor(name, diagnostic_collection, logger) {
        this.diagnostic_collection = diagnostic_collection;
        this.name = name;
        this.logger = logger;
    }
    startLint(doc) {
        this.lint(doc);
    }
    removeFileDiagnostics(doc) {
        this.diagnostic_collection.delete(doc.uri);
    }
}
exports.default = BaseLinter;
//# sourceMappingURL=BaseLinter.js.map