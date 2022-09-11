"use strict";
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
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
exports.AzureFunctionsService = exports.hostFileName = void 0;
const vscode = require("vscode");
const path = require("path");
const azureFunctionsContracts = require("../models/contracts/azureFunctions/azureFunctionsContracts");
const azureFunctionUtils = require("../azureFunction/azureFunctionUtils");
const constants = require("../constants/constants");
const utils_1 = require("../utils/utils");
const LocalizedConstants = require("../constants/localizedConstants");
exports.hostFileName = 'host.json';
/**
 * Adds SQL Bindings to generated Azure Functions in a file
 */
class AzureFunctionsService {
    constructor(_client) {
        this._client = _client;
    }
    /**
     * Adds a SQL Binding to a specified Azure function in a file
     * @param bindingType Type of SQL Binding
     * @param filePath Path of the file where the Azure Functions are
     * @param functionName Name of the function where the SQL Binding is to be added
     * @param objectName Name of Object for the SQL Query
     * @param connectionStringSetting Setting for the connection string
     * @returns
     */
    addSqlBinding(bindingType, filePath, functionName, objectName, connectionStringSetting) {
        const params = {
            bindingType: bindingType,
            filePath: filePath,
            functionName: functionName,
            objectName: objectName,
            connectionStringSetting: connectionStringSetting
        };
        return this._client.sendRequest(azureFunctionsContracts.AddSqlBindingRequest.type, params);
    }
    /**
     * Gets the names of the Azure functions in the file
     * @param filePath Path of the file to get the Azure functions
     * @returns array of names of Azure functions in the file
     */
    getAzureFunctions(filePath) {
        const params = {
            filePath: filePath
        };
        return this._client.sendRequest(azureFunctionsContracts.GetAzureFunctionsRequest.type, params);
    }
    createAzureFunction(connectionString, schema, table) {
        return __awaiter(this, void 0, void 0, function* () {
            const azureFunctionApi = yield azureFunctionUtils.getAzureFunctionsExtensionApi();
            if (!azureFunctionApi) {
                return;
            }
            let projectFile = yield azureFunctionUtils.getAzureFunctionProject();
            if (!projectFile) {
                let projectCreate = yield vscode.window.showErrorMessage(LocalizedConstants.azureFunctionsProjectMustBeOpened, LocalizedConstants.createProject, LocalizedConstants.learnMore);
                if (projectCreate === LocalizedConstants.learnMore) {
                    vscode.commands.executeCommand('vscode.open', vscode.Uri.parse(constants.sqlBindingsDoc));
                }
                else if (projectCreate === LocalizedConstants.createProject) {
                    // start the create azure function project flow
                    yield azureFunctionApi.createFunction({});
                }
                return;
            }
            // because of an AF extension API issue, we have to get the newly created file by adding
            // a watcher: https://github.com/microsoft/vscode-azurefunctions/issues/2908
            const newFunctionFileObject = azureFunctionUtils.waitForNewFunctionFile(projectFile);
            let functionFile;
            let functionName;
            try {
                // get function name from user
                let uniqueFunctionName = yield utils_1.getUniqueFileName(path.dirname(projectFile), table);
                functionName = yield vscode.window.showInputBox({
                    title: LocalizedConstants.functionNameTitle,
                    value: uniqueFunctionName,
                    ignoreFocusOut: true,
                    validateInput: input => input ? undefined : LocalizedConstants.nameMustNotBeEmpty
                });
                if (!functionName) {
                    return;
                }
                // create C# HttpTrigger
                yield azureFunctionApi.createFunction({
                    language: 'C#',
                    templateId: 'HttpTrigger',
                    functionName: functionName,
                    folderPath: projectFile
                });
                // check for the new function file to be created and dispose of the file system watcher
                const timeout = utils_1.timeoutPromise(LocalizedConstants.timeoutAzureFunctionFileError);
                functionFile = yield Promise.race([newFunctionFileObject.filePromise, timeout]);
            }
            finally {
                newFunctionFileObject.watcherDisposable.dispose();
            }
            // select input or output binding
            const inputOutputItems = [
                {
                    label: LocalizedConstants.input,
                    type: 0 /* input */
                },
                {
                    label: LocalizedConstants.output,
                    type: 1 /* output */
                }
            ];
            const selectedBinding = yield vscode.window.showQuickPick(inputOutputItems, {
                canPickMany: false,
                title: LocalizedConstants.selectBindingType,
                ignoreFocusOut: true
            });
            if (!selectedBinding) {
                return;
            }
            yield azureFunctionUtils.addNugetReferenceToProjectFile(projectFile);
            yield azureFunctionUtils.addConnectionStringToConfig(connectionString, projectFile);
            let objectName = utils_1.generateQuotedFullName(schema, table);
            yield this.addSqlBinding(selectedBinding.type, functionFile, functionName, objectName, constants.sqlConnectionString);
            azureFunctionUtils.overwriteAzureFunctionMethodBody(functionFile);
        });
    }
}
exports.AzureFunctionsService = AzureFunctionsService;

//# sourceMappingURL=azureFunctionsService.js.map
