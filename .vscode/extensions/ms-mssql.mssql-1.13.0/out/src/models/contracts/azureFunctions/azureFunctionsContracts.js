"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAzureFunctionsRequest = exports.AddSqlBindingRequest = void 0;
const vscode_languageclient_1 = require("vscode-languageclient");
/**
 * Adds a SQL Binding to a specified Azure function in a file
 */
var AddSqlBindingRequest;
(function (AddSqlBindingRequest) {
    AddSqlBindingRequest.type = new vscode_languageclient_1.RequestType('azureFunctions/sqlBinding');
})(AddSqlBindingRequest = exports.AddSqlBindingRequest || (exports.AddSqlBindingRequest = {}));
/**
 * Gets the names of the Azure functions in a file
 */
var GetAzureFunctionsRequest;
(function (GetAzureFunctionsRequest) {
    GetAzureFunctionsRequest.type = new vscode_languageclient_1.RequestType('azureFunctions/getAzureFunctions');
})(GetAzureFunctionsRequest = exports.GetAzureFunctionsRequest || (exports.GetAzureFunctionsRequest = {}));

//# sourceMappingURL=azureFunctionsContracts.js.map
