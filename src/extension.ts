// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "spring-find-endpoints" is now active!'
  );

  const disposableSearch = vscode.commands.registerCommand(
    "spring-find-endpoints.searchEndpoints",
    async () => {
      const endpoints = await searchForEndpoints();
      if (endpoints.length > 0) {
        const selected = await vscode.window.showQuickPick(
          endpoints.map((ep) => ep.label),
          { placeHolder: "Select an endpoint to jump to" }
        );
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
      } else {
        vscode.window.showInformationMessage("No endpoints found.");
      }
    }
  );

  context.subscriptions.push(disposableSearch);

  // Register the context menu command for copying API URL
  const disposableCopyUrl = vscode.commands.registerCommand(
    "spring-find-endpoints.copyApiUrl",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const line = editor.selection.active.line; // Get the current line number
        const file = editor.document.fileName; // Get the current file name
        const endpoints = await searchForEndpoints(); // Get the endpoints again

        // Find the endpoint that matches the current file and line number
        const endpoint = endpoints.find(
          (ep) => ep.line === line && ep.file === file
        );
        if (endpoint) {
          await vscode.env.clipboard.writeText(endpoint.apiPath);
          vscode.window.showInformationMessage(
            `Copied API URL: ${endpoint.apiPath}`
          );
        } else {
          vscode.window.showErrorMessage(
            "No API URL found for this line in the current file."
          );
        }
      }
    }
  );

  context.subscriptions.push(disposableCopyUrl);
}

// Function to search for endpoints in the workspace
async function searchForEndpoints(): Promise<
  { label: string; file: string; line: number; apiPath: string }[]
> {
  const endpoints: {
    label: string;
    file: string;
    line: number;
    apiPath: string;
  }[] = [];
  const files = await vscode.workspace.findFiles("**/*.java"); // Adjust the pattern as needed

  for (const file of files) {
    const content = await vscode.workspace.fs.readFile(file);
    const text = content.toString();
    const classRegex = /@RequestMapping\(["']([^"']+)["']\)/g;
    const methodRegex =
      /@(GetMapping|PostMapping|PutMapping|DeleteMapping|RequestMapping)\(["']([^"']+)["']\)/g;

    let classMatch;
    let classPath = "";

    // Record the class definition line to prevent duplicate additions
    const linesWithClassMapping = new Set<number>();

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
        } else {
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
export function deactivate() {}
