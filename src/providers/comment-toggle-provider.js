// @ts-check
'use strict';

const vscode = require('vscode');

/**
 * Context-aware comment toggle provider for Template Toolkit files.
 * Determines comment style based on the current cursor position's scope.
 */
class CommentToggleProvider {
    /**
     * @param {vscode.TextDocument} document
     * @param {vscode.Position} position
     * @returns {{ lineComment?: string, blockComment?: [string, string] }}
     */
    getCommentStyle(document, position) {
        const text = document.getText();
        const offset = document.offsetAt(position);
        const line = document.lineAt(position.line).text;

        // Check if we're inside a Template Toolkit tag [% ... %]
        const ttStyle = this.getTTCommentStyle(text, offset, line);
        if (ttStyle) {
            return ttStyle;
        }

        // Check if we're inside a <script> tag (JavaScript)
        const jsStyle = this.getJSCommentStyle(text, offset);
        if (jsStyle) {
            return jsStyle;
        }

        // Check if we're inside a <style> tag (CSS)
        const cssStyle = this.getCSSCommentStyle(text, offset);
        if (cssStyle) {
            return cssStyle;
        }

        // Default to HTML comment style
        return {
            blockComment: ['<!--', '-->']
        };
    }

    /**
     * Check if position is inside a Template Toolkit tag and return comment style.
     * @param {string} text
     * @param {number} offset
     * @param {string} currentLine
     * @returns {{ lineComment?: string, blockComment?: [string, string] } | null}
     */
    getTTCommentStyle(text, offset, currentLine) {
        // Look for [% ... %] tags - find the most recent opening tag before this position
        // that doesn't have a closing tag yet

        let inTTTag = false;
        let tagDepth = 0;

        // Scan from the beginning to find if we're inside a TT tag
        for (let i = 0; i < offset; i++) {
            // Check for opening tag [% (with optional chomp modifiers)
            if (text[i] === '[' && text[i + 1] === '%') {
                // Check if this is a comment tag [%#
                if (text[i + 2] === '#') {
                    // Skip until we find the closing %]
                    let j = i + 3;
                    while (j < text.length) {
                        if (text[j] === '%' && text[j + 1] === ']') {
                            i = j + 1;
                            break;
                        }
                        j++;
                    }
                    continue;
                }
                tagDepth++;
                inTTTag = true;
            }
            // Check for closing tag %]
            else if (text[i] === '%' && text[i + 1] === ']' && tagDepth > 0) {
                tagDepth--;
                inTTTag = tagDepth > 0;
            }
        }

        if (inTTTag && tagDepth > 0) {
            // Inside a TT tag - use # for line comments
            return {
                lineComment: '#'
            };
        }

        // Also check for outline mode tags (lines starting with %%)
        if (currentLine.trimStart().startsWith('%%')) {
            return {
                lineComment: '#'
            };
        }

        return null;
    }

    /**
     * Check if position is inside a <script> tag.
     * @param {string} text
     * @param {number} offset
     * @returns {{ lineComment?: string, blockComment?: [string, string] } | null}
     */
    getJSCommentStyle(text, offset) {
        const result = this.isInsideTag(text, offset, 'script');
        if (result) {
            return {
                lineComment: '//',
                blockComment: ['/*', '*/']
            };
        }
        return null;
    }

    /**
     * Check if position is inside a <style> tag.
     * @param {string} text
     * @param {number} offset
     * @returns {{ lineComment?: string, blockComment?: [string, string] } | null}
     */
    getCSSCommentStyle(text, offset) {
        const result = this.isInsideTag(text, offset, 'style');
        if (result) {
            return {
                blockComment: ['/*', '*/']
            };
        }
        return null;
    }

    /**
     * Check if position is inside a specific HTML tag.
     * @param {string} text
     * @param {number} offset
     * @param {string} tagName
     * @returns {boolean}
     */
    isInsideTag(text, offset, tagName) {
        // Regex to find opening and closing tags
        const openTagRegex = new RegExp(`<${tagName}[^>]*>`, 'gi');
        const closeTagRegex = new RegExp(`</${tagName}[^>]*>`, 'gi');

        // Find all tag matches
        const matches = [];

        let match;
        openTagRegex.lastIndex = 0;
        while ((match = openTagRegex.exec(text)) !== null) {
            matches.push({ index: match.index, type: 'open' });
        }

        closeTagRegex.lastIndex = 0;
        while ((match = closeTagRegex.exec(text)) !== null) {
            matches.push({ index: match.index, type: 'close' });
        }

        // Sort matches by index
        matches.sort((a, b) => a.index - b.index);

        // Check if we're inside a tag (between the opening tag content and closing tag)
        let depth = 0;
        for (const m of matches) {
            if (m.index > offset) break;

            if (m.type === 'open') {
                depth++;
            } else {
                depth--;
            }
        }

        return depth > 0;
    }

    /**
     * Toggle line comment for the given lines.
     * @param {vscode.TextDocument} document
     * @param {vscode.Range} range
     * @param {string} commentStr
     * @returns {vscode.TextEdit[]}
     */
    toggleLineComment(document, range, commentStr) {
        const edits = [];
        const lines = [];

        // Collect all lines in the range
        for (let i = range.start.line; i <= range.end.line; i++) {
            lines.push(document.lineAt(i));
        }

        // Check if all lines are commented
        const allCommented = lines.every(line => {
            const trimmed = line.text.trimStart();
            return trimmed.startsWith(commentStr) || trimmed.length === 0;
        });

        // Comment or uncomment each line
        for (const line of lines) {
            if (line.isEmptyOrWhitespace) continue;

            if (allCommented) {
                // Remove comment - find where the comment marker is
                const commentIndex = line.text.indexOf(commentStr);
                if (commentIndex !== -1) {
                    const start = new vscode.Position(line.lineNumber, commentIndex);
                    const end = new vscode.Position(line.lineNumber, commentIndex + commentStr.length);
                    // Check for trailing space after comment marker (remove it too)
                    const afterComment = line.text.substring(commentIndex + commentStr.length);
                    const spaceMatch = afterComment.match(/^( +)/);
                    if (spaceMatch) {
                        edits.push(vscode.TextEdit.delete(new vscode.Range(start, new vscode.Position(line.lineNumber, commentIndex + commentStr.length + spaceMatch[1].length))));
                    } else {
                        edits.push(vscode.TextEdit.delete(new vscode.Range(start, end)));
                    }
                }
            } else {
                // Add comment after the indentation (preserve tabs/spaces)
                const indentMatch = line.text.match(/^(\s*)/);
                const indent = indentMatch ? indentMatch[1] : '';
                const insertPos = new vscode.Position(line.lineNumber, indent.length);
                edits.push(vscode.TextEdit.insert(insertPos, commentStr + ' '));
            }
        }

        return edits;
    }

    /**
     * Toggle block comment for the given range.
     * @param {vscode.TextDocument} document
     * @param {vscode.Range} range
     * @param {string} startComment
     * @param {string} endComment
     * @returns {vscode.TextEdit[]}
     */
    toggleBlockComment(document, range, startComment, endComment) {
        const text = document.getText(range);

        // Check if the selection is already wrapped in a block comment
        const trimmedStart = text.trimStart().startsWith(startComment);
        const trimmedEnd = text.trimEnd().endsWith(endComment);

        if (trimmedStart && trimmedEnd) {
            // Remove block comment
            const startOffset = document.offsetAt(range.start);
            const endOffset = document.offsetAt(range.end);
            const fullText = document.getText();

            // Find the comment markers
            const startIndex = fullText.indexOf(startComment, startOffset);
            const endIndex = fullText.lastIndexOf(endComment, endOffset + endComment.length);

            if (startIndex !== -1 && endIndex !== -1 && startIndex < endIndex) {
                const edits = [];
                // Remove end comment (and optional preceding space)
                let removeEndStart = endIndex;
                if (fullText.substring(endIndex - 1, endIndex) === ' ') {
                    removeEndStart = endIndex - 1;
                }
                edits.push(vscode.TextEdit.delete(new vscode.Range(
                    document.positionAt(removeEndStart),
                    document.positionAt(endIndex + endComment.length)
                )));
                // Remove start comment (and optional trailing space)
                let removeStartEnd = startIndex + startComment.length;
                if (fullText.substring(removeStartEnd, removeStartEnd + 1) === ' ') {
                    removeStartEnd++;
                }
                edits.push(vscode.TextEdit.delete(new vscode.Range(
                    document.positionAt(startIndex),
                    document.positionAt(removeStartEnd)
                )));
                return edits;
            }
        }

        // Add block comment - preserve indentation
        const startLine = document.lineAt(range.start.line);
        const indentMatch = startLine.text.match(/^(\s*)/);
        const indent = indentMatch ? indentMatch[1] : '';

        // Calculate where to insert the start comment
        // If selection starts at the beginning of the line (after indent), preserve indent
        const insertStartPos = range.start.character <= indent.length
            ? new vscode.Position(range.start.line, indent.length)
            : range.start;

        return [
            vscode.TextEdit.insert(range.end, ' ' + endComment),
            vscode.TextEdit.insert(insertStartPos, startComment + ' ')
        ];
    }

    /**
     * Escape special regex characters.
     * @param {string} str
     * @returns {string}
     */
    escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
}

/**
 * Register the comment toggle command.
 * @param {vscode.ExtensionContext} context
 */
function registerCommentToggle(context) {
    const provider = new CommentToggleProvider();

    // Register the comment toggle command
    const disposable = vscode.commands.registerCommand('tt.toggleComment', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const document = editor.document;
        const selections = editor.selections;

        // Get the primary selection's position for determining comment style
        const primaryPosition = selections[0].active;
        const commentStyle = provider.getCommentStyle(document, primaryPosition);

        editor.edit(editBuilder => {
            for (const selection of selections) {
                let range = selection.isEmpty
                    ? new vscode.Range(
                        document.lineAt(selection.start.line).range.start,
                        document.lineAt(selection.end.line).range.end
                    )
                    : new vscode.Range(selection.start, selection.end);

                let edits;

                if (commentStyle.lineComment && (selection.isEmpty || isFullLines(document, selection))) {
                    // Use line comment for empty selections or full-line selections
                    edits = provider.toggleLineComment(document, range, commentStyle.lineComment);
                } else if (commentStyle.blockComment) {
                    // Use block comment for partial selections
                    edits = provider.toggleBlockComment(document, range, commentStyle.blockComment[0], commentStyle.blockComment[1]);
                }

                if (edits) {
                    for (const edit of edits) {
                        editBuilder.replace(edit.range, edit.newText || '');
                    }
                }
            }
        });
    });

    context.subscriptions.push(disposable);
}

/**
 * Check if a selection covers complete lines.
 * @param {vscode.TextDocument} document
 * @param {vscode.Selection} selection
 * @returns {boolean}
 */
function isFullLines(document, selection) {
    return selection.start.character === 0 &&
           selection.end.character === document.lineAt(selection.end.line).text.length;
}

module.exports = {
    CommentToggleProvider,
    registerCommentToggle
};