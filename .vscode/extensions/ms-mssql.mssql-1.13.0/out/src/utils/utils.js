"use strict";
/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
exports.getUniqueFileName = exports.timeoutPromise = exports.generateQuotedFullName = exports.executeCommand = void 0;
const cp = require("child_process");
const fs = require("fs");
const path = require("path");
const utils_1 = require("../models/utils");
function executeCommand(command, cwd) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            cp.exec(command, { maxBuffer: 500 * 1024, cwd: cwd }, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (stderr && stderr.length > 0) {
                    reject(new Error(stderr));
                    return;
                }
                resolve(stdout);
            });
        });
    });
}
exports.executeCommand = executeCommand;
/**
 * Generates a quoted full name for the object
 * @param schema of the object
 * @param objectName object chosen by the user
 * @returns the quoted and escaped full name of the specified schema and object
 */
function generateQuotedFullName(schema, objectName) {
    return `[${utils_1.escapeClosingBrackets(schema)}].[${utils_1.escapeClosingBrackets(objectName)}]`;
}
exports.generateQuotedFullName = generateQuotedFullName;
/**
 * Returns a promise that will reject after the specified timeout
 * @param ms timeout in milliseconds. Default is 10 seconds
 * @param errorMessage error message to be returned in the rejection
 * @returns a promise that rejects after the specified timeout
 */
function timeoutPromise(errorMessage, ms = 10000) {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(errorMessage));
        }, ms);
    });
}
exports.timeoutPromise = timeoutPromise;
/**
 * Gets a unique file name
 * Increment the file name by adding 1 to function name if the file already exists
 * Undefined if the filename suffix count becomes greater than 1024
 * @param folderPath selected project folder path
 * @param fileName base filename to use
 * @returns a promise with the unique file name, or undefined
 */
function getUniqueFileName(folderPath, fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        let count = 0;
        const maxCount = 1024;
        let uniqueFileName = fileName;
        while (count < maxCount) {
            if (!fs.existsSync(path.join(folderPath, uniqueFileName + '.cs'))) {
                return uniqueFileName;
            }
            count += 1;
            uniqueFileName = fileName + count.toString();
        }
        return undefined;
    });
}
exports.getUniqueFileName = getUniqueFileName;

//# sourceMappingURL=utils.js.map
