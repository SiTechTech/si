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
exports.addConnectionStringToConfig = exports.addNugetReferenceToProjectFile = exports.waitForNewFunctionFile = exports.getSettingsFile = exports.getHostFiles = exports.getAzureFunctionProjectFiles = exports.getAzureFunctionProject = exports.overwriteAzureFunctionMethodBody = exports.getAzureFunctionsExtensionApi = exports.setLocalAppSetting = exports.getLocalSettingsJson = void 0;
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
const os = require("os");
const fs = require("fs");
const path = require("path");
const vscode = require("vscode");
const utils = require("../models/utils");
const constants = require("../constants/constants");
const LocalizedConstants = require("../constants/localizedConstants");
const utils_1 = require("../utils/utils");
/**
 * copied and modified from vscode-azurefunctions extension
 * https://github.com/microsoft/vscode-azurefunctions/blob/main/src/funcConfig/local.settings.ts
 * @param localSettingsPath full path to local.settings.json
 * @returns settings in local.settings.json. If no settings are found, returns default "empty" settings
 */
function getLocalSettingsJson(localSettingsPath) {
    return __awaiter(this, void 0, void 0, function* () {
        if (fs.existsSync(localSettingsPath)) {
            const data = (fs.readFileSync(localSettingsPath)).toString();
            try {
                return JSON.parse(data);
            }
            catch (error) {
                console.log(error);
                throw new Error(utils.formatString(LocalizedConstants.failedToParse, constants.azureFunctionLocalSettingsFileName, error.message));
            }
        }
        return {
            IsEncrypted: false // Include this by default otherwise the func cli assumes settings are encrypted and fails to run
        };
    });
}
exports.getLocalSettingsJson = getLocalSettingsJson;
/**
 * Adds a new setting to a project's local.settings.json file
 * modified from setLocalAppSetting code from vscode-azurefunctions extension
 * @param projectFolder full path to project folder
 * @param key Key of the new setting
 * @param value Value of the new setting
 * @returns true if successful adding the new setting, false if unsuccessful
 */
function setLocalAppSetting(projectFolder, key, value) {
    return __awaiter(this, void 0, void 0, function* () {
        const localSettingsPath = path.join(projectFolder, constants.azureFunctionLocalSettingsFileName);
        const settings = yield getLocalSettingsJson(localSettingsPath);
        settings.Values = settings.Values || {};
        if (settings.Values[key] === value) {
            // don't do anything if it's the same as the existing value
            return true;
        }
        else if (settings.Values[key]) {
            const result = yield vscode.window.showWarningMessage(utils.formatString(LocalizedConstants.settingAlreadyExists, key), { modal: true }, LocalizedConstants.yesString);
            if (result !== LocalizedConstants.yesString) {
                // key already exists and user doesn't want to overwrite it
                return false;
            }
        }
        settings.Values[key] = value;
        fs.promises.writeFile(localSettingsPath, JSON.stringify(settings, undefined, 2));
        return true;
    });
}
exports.setLocalAppSetting = setLocalAppSetting;
/**
 * Gets the Azure Functions extension API if it is installed
 * if it is not installed, prompt the user to install directly, learn more, or do not install
 * @returns the Azure Functions extension API if it is installed, prompt if it is not installed
 */
function getAzureFunctionsExtensionApi() {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        let apiProvider = yield ((_a = vscode.extensions.getExtension(constants.azureFunctionsExtensionName)) === null || _a === void 0 ? void 0 : _a.activate());
        if (!apiProvider) {
            const response = yield vscode.window.showInformationMessage(LocalizedConstants.azureFunctionsExtensionNotFound, LocalizedConstants.install, LocalizedConstants.learnMore, LocalizedConstants.doNotInstall);
            if (response === LocalizedConstants.install) {
                const extensionInstalled = new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        reject(new Error(LocalizedConstants.timeoutExtensionError));
                        extensionChange.dispose();
                    }), 10000);
                    let extensionChange = vscode.extensions.onDidChange(() => __awaiter(this, void 0, void 0, function* () {
                        if (vscode.extensions.getExtension(constants.azureFunctionsExtensionName)) {
                            resolve();
                            extensionChange.dispose();
                            clearTimeout(timeout);
                        }
                    }));
                });
                yield vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: constants.azureFunctionsExtensionName,
                    cancellable: false
                }, (_progress, _token) => __awaiter(this, void 0, void 0, function* () {
                    yield vscode.commands.executeCommand('workbench.extensions.installExtension', constants.azureFunctionsExtensionName);
                }));
                // the extension has not been notified that the azure function extension is installed so wait till it is to then activate it
                yield extensionInstalled;
                apiProvider = (yield ((_b = vscode.extensions.getExtension(constants.azureFunctionsExtensionName)) === null || _b === void 0 ? void 0 : _b.activate()));
            }
            else if (response === LocalizedConstants.learnMore) {
                yield vscode.env.openExternal(vscode.Uri.parse(constants.linkToAzureFunctionExtension));
                return undefined;
            }
            else {
                return undefined;
            }
        }
        const azureFunctionApi = apiProvider.getApi('*');
        if (azureFunctionApi) {
            return azureFunctionApi;
        }
        else {
            vscode.window.showErrorMessage(LocalizedConstants.azureFunctionsExtensionNotInstalled);
            return undefined;
        }
    });
}
exports.getAzureFunctionsExtensionApi = getAzureFunctionsExtensionApi;
/**
 * Overwrites the Azure function methods body to work with the binding
 * @param filePath is the path for the function file (.cs for C# functions)
 */
function overwriteAzureFunctionMethodBody(filePath) {
    let defaultBindedFunctionText = fs.readFileSync(filePath, 'utf-8');
    // Replace default binding text
    let newValueLines = defaultBindedFunctionText.split(os.EOL);
    const defaultFunctionTextToSkip = new Set(constants.defaultSqlBindingTextLines);
    let replacedValueLines = [];
    for (let defaultLine of newValueLines) {
        // Skipped lines
        if (defaultFunctionTextToSkip.has(defaultLine.trimStart())) {
            continue;
        }
        else if (defaultLine.trimStart() === constants.defaultBindingResult) { // Result change
            replacedValueLines.push(defaultLine.replace(constants.defaultBindingResult, constants.sqlBindingResult));
        }
        else {
            // Normal lines to be included
            replacedValueLines.push(defaultLine);
        }
    }
    defaultBindedFunctionText = replacedValueLines.join(os.EOL);
    fs.writeFileSync(filePath, defaultBindedFunctionText, 'utf-8');
}
exports.overwriteAzureFunctionMethodBody = overwriteAzureFunctionMethodBody;
/**
 * Gets the azure function project for the user to choose from a list of projects files
 * If only one project is found that project is used to add the binding to
 * if no project is found, user is informed there needs to be a C# Azure Functions project
 * @returns the selected project file path
 */
function getAzureFunctionProject() {
    return __awaiter(this, void 0, void 0, function* () {
        let selectedProjectFile = '';
        if (vscode.workspace.workspaceFolders === undefined || vscode.workspace.workspaceFolders.length === 0) {
            return selectedProjectFile;
        }
        else {
            const projectFiles = yield getAzureFunctionProjectFiles();
            if (projectFiles !== undefined) {
                if (projectFiles.length > 1) {
                    // select project to add azure function to
                    selectedProjectFile = (yield vscode.window.showQuickPick(projectFiles, {
                        canPickMany: false,
                        title: LocalizedConstants.selectProject,
                        ignoreFocusOut: true
                    }));
                    return selectedProjectFile;
                }
                else if (projectFiles.length === 1) {
                    // only one azure function project found
                    return projectFiles[0];
                }
            }
            return undefined;
        }
    });
}
exports.getAzureFunctionProject = getAzureFunctionProject;
/**
 * Gets the azure function project files based on the host file found in the same folder
 * @returns the azure function project files paths
 */
function getAzureFunctionProjectFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        let projFiles = [];
        const hostFiles = yield getHostFiles();
        if (!hostFiles) {
            return undefined;
        }
        for (let host of hostFiles) {
            let projectFile = yield vscode.workspace.findFiles('*.csproj', path.dirname(host));
            projectFile.filter(file => path.dirname(file.fsPath) === path.dirname(host) ? projFiles.push(file === null || file === void 0 ? void 0 : file.fsPath) : projFiles);
        }
        return projFiles.length > 0 ? projFiles : undefined;
    });
}
exports.getAzureFunctionProjectFiles = getAzureFunctionProjectFiles;
/**
 * Gets the host files from the workspace
 * @returns the host file paths
 */
function getHostFiles() {
    return __awaiter(this, void 0, void 0, function* () {
        const hostUris = yield vscode.workspace.findFiles('**/host.json');
        const hostFiles = hostUris.map(uri => uri.fsPath);
        return hostFiles.length > 0 ? hostFiles : undefined;
    });
}
exports.getHostFiles = getHostFiles;
/**
 * Gets the local.settings.json file path
 * @param projectFile path of the azure function project
 * @returns the local.settings.json file path
 */
function getSettingsFile(projectFile) {
    return __awaiter(this, void 0, void 0, function* () {
        return path.join(path.dirname(projectFile), 'local.settings.json');
    });
}
exports.getSettingsFile = getSettingsFile;
/**
 * Retrieves the new function file once the file is created and the watcher disposable
 * @param projectFile is the path to the project file
 * @returns the function file path once created and the watcher disposable
 */
function waitForNewFunctionFile(projectFile) {
    const watcher = vscode.workspace.createFileSystemWatcher((path.dirname(projectFile), '**/*.cs'), false, true, true);
    const filePromise = new Promise((resolve, _) => {
        watcher.onDidCreate((e) => {
            resolve(e.fsPath);
        });
    });
    return {
        filePromise,
        watcherDisposable: watcher
    };
}
exports.waitForNewFunctionFile = waitForNewFunctionFile;
/**
 * Adds the required nuget package to the project
 * @param selectedProjectFile is the users selected project file path
 */
function addNugetReferenceToProjectFile(selectedProjectFile) {
    return __awaiter(this, void 0, void 0, function* () {
        yield utils_1.executeCommand(`dotnet add ${selectedProjectFile} package ${constants.sqlExtensionPackageName} --prerelease`);
    });
}
exports.addNugetReferenceToProjectFile = addNugetReferenceToProjectFile;
/**
 * Adds the Sql Connection String to the local.settings.json
 * @param connectionString of the SQL Server connection that was chosen by the user
 */
function addConnectionStringToConfig(connectionString, projectFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const settingsFile = yield getSettingsFile(projectFile);
        yield setLocalAppSetting(path.dirname(settingsFile), constants.sqlConnectionString, connectionString);
    });
}
exports.addConnectionStringToConfig = addConnectionStringToConfig;

//# sourceMappingURL=azureFunctionUtils.js.map
