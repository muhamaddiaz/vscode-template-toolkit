// @ts-check
'use strict';

const vscode = require('vscode');
const {
    createDocumentFormattingEditProvider,
    createDocumentRangeFormattingEditProvider,
} = require('./formatter');
const { BootstrapCompletionProvider, BootstrapHoverProvider } = require('./providers/bootstrap5-provider');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    const selector = [{ language: 'tt' }];

    // Format entire document
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(
            selector,
            createDocumentFormattingEditProvider()
        )
    );

    // Format selection (expands to full lines for correct indentation)
    context.subscriptions.push(
        vscode.languages.registerDocumentRangeFormattingEditProvider(
            selector,
            createDocumentRangeFormattingEditProvider()
        )
    );

    // Bootstrap IntelliSense - Completion Provider
    const bootstrapCompletionProvider = new BootstrapCompletionProvider();
    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            selector,
            bootstrapCompletionProvider,
            '"', "'", ' ', '-'
        )
    );

    // Bootstrap IntelliSense - Hover Provider
    const bootstrapHoverProvider = new BootstrapHoverProvider();
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(selector, bootstrapHoverProvider)
    );
}

function deactivate() {}

module.exports = { activate, deactivate };