"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const child_process_1 = require("child_process");
const BaseLinter_1 = require("./BaseLinter");
const Logger_1 = require("../Logger");
class XvlogLinter extends BaseLinter_1.default {
    constructor(diagnostic_collection, logger) {
        super('xvlog', diagnostic_collection, logger);
        vscode_1.workspace.onDidChangeConfiguration(() => {
            this.getConfig();
        });
        this.getConfig();
    }
    getConfig() {
        this.xvlogPath = (vscode_1.workspace.getConfiguration().get('verilog.linting.path'));
        this.xvlogArgs = (vscode_1.workspace.getConfiguration().get('verilog.linting.xvlog.arguments'));
    }
    lint(doc) {
        this.logger.log('xvlog lint requested');
        let svArgs = doc.languageId == 'systemverilog' ? '-sv' : ''; //Systemverilog args
        let command = this.xvlogPath +
            'xvlog ' +
            svArgs +
            ' -nolog ' +
            this.xvlogArgs +
            ' "' +
            doc.fileName +
            '"';
        this.logger.log(command, Logger_1.Log_Severity.Command);
        let process = (0, child_process_1.exec)(command, (error, stdout, stderr) => {
            let diagnostics = [];
            let lines = stdout.split(/\r?\n/g);
            lines.forEach((line) => {
                let match = line.match(/^(ERROR|WARNING):\s+\[(VRFC\b[^\]]*)\]\s+(.*\S)\s+\[(.*):(\d+)\]\s*$/);
                if (!match) {
                    return;
                }
                let severity = match[1] === 'ERROR'
                    ? vscode_1.DiagnosticSeverity.Error
                    : vscode_1.DiagnosticSeverity.Warning;
                // Get filename and line number
                let filename = match[4];
                let lineno_str = match[5];
                let lineno = parseInt(lineno_str) - 1;
                // if (filename != doc.fileName) // Check that filename matches
                //     return;
                let diagnostic = {
                    severity: severity,
                    code: match[2],
                    message: '[' + match[2] + '] ' + match[3],
                    range: new vscode_1.Range(lineno, 0, lineno, Number.MAX_VALUE),
                    source: 'xvlog',
                };
                diagnostics.push(diagnostic);
            });
            this.logger.log(diagnostics.length + ' errors/warnings returned');
            this.diagnostic_collection.set(doc.uri, diagnostics);
        });
    }
}
exports.default = XvlogLinter;
//# sourceMappingURL=XvlogLinter.js.map