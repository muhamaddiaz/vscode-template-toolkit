// Bootstrap 5 IntelliSense Providers
const vscode = require('vscode');
const { getAllBootstrapClasses, getClassDescription } = require('../data/bootstrap5-classes');

// Cached completion items
let cachedCompletionItems = null;

/**
 * Create completion items from Bootstrap classes
 * @returns {vscode.CompletionItem[]}
 */
function createBootstrapCompletionItems() {
    if (cachedCompletionItems) {
        return cachedCompletionItems;
    }

    const allClasses = getAllBootstrapClasses();
    cachedCompletionItems = allClasses.map(className => {
        const item = new vscode.CompletionItem(className, vscode.CompletionItemKind.Value);
        item.detail = 'Bootstrap 5';
        item.documentation = new vscode.MarkdownString(getClassDescription(className));
        item.insertText = className;
        return item;
    });

    return cachedCompletionItems;
}

/**
 * Bootstrap 5 Completion Provider
 */
class BootstrapCompletionProvider {
    constructor() {
        this.completionItems = createBootstrapCompletionItems();
    }

    /**
     * @param {vscode.TextDocument} document
     * @param {vscode.Position} position
     * @returns {vscode.CompletionItem[]}
     */
    provideCompletionItems(document, position) {
        const lineText = document.lineAt(position).text.substring(0, position.character);

        // Check if we're in a class attribute context
        const classAttrMatch = lineText.match(/class\s*=\s*["']([^"']*)$/);
        const classValueMatch = lineText.match(/class\s*=\s*["'][^"']*\s+$/);

        if (classAttrMatch || classValueMatch) {
            return this.completionItems;
        }

        // Check for TT class variable
        const ttClassMatch = lineText.match(/class\s*=>?\s*["']([^"']*)$/);
        if (ttClassMatch) {
            return this.completionItems;
        }

        return [];
    }
}

/**
 * Bootstrap 5 Hover Provider
 */
class BootstrapHoverProvider {
    /**
     * @param {vscode.TextDocument} document
     * @param {vscode.Position} position
     * @returns {vscode.Hover | undefined}
     */
    provideHover(document, position) {
        const range = document.getWordRangeAtPosition(position, /[a-zA-Z0-9_-]+/);
        if (!range) return;

        const word = document.getText(range);
        const allClasses = getAllBootstrapClasses();

        if (allClasses.includes(word)) {
            const description = getClassDescription(word);
            const contents = new vscode.MarkdownString();
            contents.appendCodeblock(word, 'html');
            contents.appendMarkdown(`**Bootstrap 5**\n\n${description}`);
            contents.isTrusted = true;
            return new vscode.Hover(contents, range);
        }
    }
}

module.exports = {
    BootstrapCompletionProvider,
    BootstrapHoverProvider,
    createBootstrapCompletionItems,
};