# Spring Endpoints Extension for VS Code

This extension provides a convenient way to find, navigate, and copy all Spring endpoints in your project within VS Code.

## Features

### Find Endpoints

* Search for all Spring endpoints in your project, including both class-level and method-level mappings.
* Quickly navigate to the endpoint definition in your code by selecting it from the search results.

### Copy API URL

* Right-click on a line in your code and select "Copy API URL" to copy the API path of the endpoint defined on that line.
* This feature is especially useful for quickly testing endpoints or sharing them with others.

## Usage

### Find Endpoints
![Find Endpoints](https://github.com/lijunjie1991/vscode-spring-endpoints/blob/main/images/find-endpoints.png?raw=true)

1. Open the Command Palette in VS Code by pressing `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (macOS).
2. Type "Find Endpoints" and select "Spring Find Endpoints: Search Endpoints" from the dropdown list.
3. A list of all found endpoints will be displayed. Select an endpoint to navigate to its definition in your code.
4. You can also trigger the search by pressing `Ctrl+\` (Windows/Linux) or `Cmd+\` (macOS).

### Copy API URL
![Copy API URL](https://github.com/lijunjie1991/vscode-spring-endpoints/blob/main/images/copy-api-url.png?raw=true)
![Copy API URL](https://github.com/lijunjie1991/vscode-spring-endpoints/blob/main/images/copy-api-url-2.png)

1. Open a Java file in VS Code.
2. Right-click on a line in the file where an endpoint is defined.
3. Select "Copy API URL" from the context menu.
4. The API path of the endpoint will be copied to your clipboard.

## Configuration

This extension does not require any configuration. It will automatically search for Spring endpoints in your project based on the standard Spring annotation patterns.

## Known Issues

* This extension currently only supports Java projects.
* It may not work correctly with complex or non-standard Spring configurations.

## Contributing

If you'd like to contribute to this extension, please fork the repository and submit a pull request. Your contributions are welcome!

## License

This extension is licensed under the MIT License.
