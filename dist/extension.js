/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __importStar(__webpack_require__(1));
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "spring-find-endpoints" is now active!');
    const disposableSearch = vscode.commands.registerCommand("spring-find-endpoints.searchEndpoints", async () => {
        const endpoints = await searchForEndpoints();
        if (endpoints.length > 0) {
            const selected = await vscode.window.showQuickPick(endpoints.map((ep) => ep.label), { placeHolder: "Select an endpoint to jump to" });
            if (selected) {
                const endpoint = endpoints.find((ep) => ep.label === selected);
                if (endpoint) {
                    const uri = vscode.Uri.file(endpoint.file);
                    const position = new vscode.Position(endpoint.line, 0);
                    const range = new vscode.Range(position, position);
                    const editor = await vscode.window.showTextDocument(uri);
                    editor.selection = new vscode.Selection(range.start, range.start);
                    editor.revealRange(range);
                }
            }
        }
        else {
            vscode.window.showInformationMessage("No endpoints found.");
        }
    });
    context.subscriptions.push(disposableSearch);
    // Register the context menu command for copying API URL
    const disposableCopyUrl = vscode.commands.registerCommand("spring-find-endpoints.copyApiUrl", async () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const line = editor.selection.active.line; // Get the current line number
            const file = editor.document.fileName; // Get the current file name
            const endpoints = await searchForEndpoints(); // Get the endpoints again
            // Find the endpoint that matches the current file and line number
            const endpoint = endpoints.find((ep) => ep.line === line && ep.file === file);
            if (endpoint) {
                await vscode.env.clipboard.writeText(endpoint.apiPath);
                vscode.window.showInformationMessage(`Copied API URL: ${endpoint.apiPath}`);
            }
            else {
                vscode.window.showErrorMessage("No API URL found for this line in the current file.");
            }
        }
    });
    context.subscriptions.push(disposableCopyUrl);
}
// Function to search for endpoints in the workspace
async function searchForEndpoints() {
    const endpoints = [];
    const files = await vscode.workspace.findFiles("**/*.java"); // Adjust the pattern as needed
    for (const file of files) {
        const content = await vscode.workspace.fs.readFile(file);
        const text = content.toString();
        const classRegex = /@RequestMapping\(["']([^"']+)["']\)/g;
        const methodRegex = /@(GetMapping|PostMapping|PutMapping|DeleteMapping|RequestMapping)\(["']([^"']+)["']\)/g;
        let classMatch;
        let classPath = "";
        // Record the class definition line to prevent duplicate additions
        const linesWithClassMapping = new Set();
        // Find class-level mapping
        while ((classMatch = classRegex.exec(text)) !== null) {
            classPath = classMatch[1];
            let classLine = text.substring(0, classMatch.index).split("\n").length;
            let nextLineIndex = classMatch.index + classMatch[0].length;
            // Content of next line
            let nextLine = text
                .substring(nextLineIndex, text.indexOf("\n", nextLineIndex + 1))
                .trimStart();
            // Filter out blank lines and annotation lines, directly locating the class definition line
            while (nextLine.startsWith("@") || nextLine.trim() === "") {
                classLine++;
                nextLineIndex += nextLine.length + 1;
                nextLine = text
                    .substring(nextLineIndex, text.indexOf("\n", nextLineIndex + 1))
                    .trimStart();
            }
            linesWithClassMapping.add(classLine);
        }
        let methodMatch;
        while ((methodMatch = methodRegex.exec(text)) !== null) {
            let methodLine = text.substring(0, methodMatch.index).split("\n").length;
            let nextLineIndex = methodMatch.index + methodMatch[0].length;
            // content of next line
            let nextLine = text
                .substring(nextLineIndex, text.indexOf("\n", nextLineIndex + 1))
                .trimStart();
            // Filter out blank lines and annotation lines, directly locating the method definition line
            while (nextLine.startsWith("@")) {
                methodLine++;
                nextLineIndex += nextLine.length + 1;
                nextLine = text
                    .substring(nextLineIndex, text.indexOf("\n", nextLineIndex + 1))
                    .trimStart();
            }
            // Only add the method mapping if its line is not in the linesWithClassMapping set
            if (!linesWithClassMapping.has(methodLine)) {
                let fullPath = "";
                if (classPath.endsWith("/") || methodMatch[2].startsWith("/")) {
                    fullPath = classPath + methodMatch[2];
                }
                else {
                    fullPath = `${classPath}/${methodMatch[2]}`;
                }
                endpoints.push({
                    label: `${fullPath} (${file.fsPath.split("/").pop()}:${methodLine + 1})`,
                    file: file.fsPath,
                    line: methodLine,
                    apiPath: fullPath,
                });
            }
        }
    }
    return endpoints.sort((a, b) => a.label.localeCompare(b.label));
}
// This method is called when your extension is deactivated
function deactivate() { }


/***/ }),
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(0);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map