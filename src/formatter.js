// Template Toolkit Document Formatter
const vscode = require('vscode');
const beautify = require('js-beautify');
const { formatTTDataStructure, isTTDataStructure } = require('./tt-data-formatter');

// TT directive categories for indentation tracking
const TT_OPEN_KW  = new Set(['IF','UNLESS','FOREACH','FOR','WHILE','SWITCH','TRY','BLOCK','WRAPPER','FILTER','MACRO']);
const TT_MID_KW   = new Set(['ELSE','ELSIF','CASE','CATCH','FINAL']);
const TT_CLOSE_KW = new Set(['END']);

/**
 * Get the indentation string based on editor configuration
 * @param {vscode.TextDocument} doc
 * @returns {string}
 */
function getIndentString(doc) {
    const cfg = vscode.workspace.getConfiguration('editor', doc.uri);
    const size  = /** @type {number}  */ (cfg.get('tabSize', 4));
    const spaces = /** @type {boolean} */ (cfg.get('insertSpaces', true));
    return spaces ? ' '.repeat(size) : '\t';
}

/**
 * Protect TT tags by replacing them with placeholders
 * @param {string} text
 * @returns {{ substituted: string, stored: string[] }}
 */
function protectTT(text) {
    /** @type {string[]} */
    const stored = [];
    const substituted = text.replace(/\[%[-+~=]?[\s\S]*?[-+~]?%\]/g, match => {
        const id = stored.length;
        stored.push(match);
        return `[__TT${id}__]`;
    });
    return { substituted, stored };
}

/**
 * Restore TT tags from placeholders
 * @param {string} text
 * @param {string[]} stored
 * @returns {string}
 */
function restoreTT(text, stored) {
    return text.replace(/\[__TT(\d+)__\]/g, (_, id) => stored[+id]);
}

/**
 * Apply TT-specific indentation on top of HTML indentation
 * @param {string} text
 * @param {string} indentStr
 * @returns {string}
 */
function applyTTIndentation(text, indentStr) {
    const lines  = text.split('\n');
    const result = [];
    let ttLevel  = 0;

    for (const line of lines) {
        const trimmed = line.trim();

        if (!trimmed) {
            result.push('');
            continue;
        }

        // Leading whitespace from js-beautify (HTML structural indent)
        const baseIndent = /** @type {string} */ (line.match(/^(\s*)/)?.[1] ?? '');

        // Count directive types present on this line
        let preDeindent = 0;
        let postIndent  = 0;

        const tagRe = /\[%[-+~=]?\s*([A-Z]+)/gi;
        let m;
        while ((m = tagRe.exec(trimmed)) !== null) {
            const kw = m[1].toUpperCase();
            if (TT_CLOSE_KW.has(kw) || TT_MID_KW.has(kw)) preDeindent++;
            if (TT_OPEN_KW.has(kw)  || TT_MID_KW.has(kw)) postIndent++;
        }

        // Deindent BEFORE printing (END / ELSE / ELSIF / CASE)
        ttLevel = Math.max(0, ttLevel - preDeindent);

        // Emit the line at baseIndent + TT extra
        result.push(baseIndent + indentStr.repeat(ttLevel) + trimmed);

        // Indent AFTER printing (IF / FOREACH / BLOCK / … / ELSE / …)
        ttLevel += postIndent;
    }

    return result.join('\n');
}

/**
 * Check if content is pure TT data structure (no HTML)
 * @param {string} text
 * @returns {boolean}
 */
function isPureTTData(text) {
    // Check if entire document is a TT data structure
    const trimmed = text.trim();

    // Must start with [% and end with %]
    if (!trimmed.startsWith('[%') || !trimmed.endsWith('%]')) {
        return false;
    }

    // Use the detection from tt-data-formatter
    return isTTDataStructure(text);
}

/**
 * Full formatting pipeline for .tt files.
 * Automatically detects TT data structures vs HTML+TT content.
 * @param {string} text
 * @param {vscode.TextDocument} doc
 * @returns {string}
 */
function formatText(text, doc) {
    const indentStr = getIndentString(doc);

    // Check if this is a pure TT data structure (not HTML)
    if (isPureTTData(text)) {
        return formatTTDataStructure(text, indentStr);
    }

    // Otherwise, treat as HTML+TT and use the HTML formatter pipeline
    return formatHTMLPlusTT(text, doc, indentStr);
}

/**
 * Format HTML+TT content (4-stage pipeline)
 * @param {string} text
 * @param {vscode.TextDocument} doc
 * @param {string} indentStr
 * @returns {string}
 */
function formatHTMLPlusTT(text, doc, indentStr) {
    const cfg = vscode.workspace.getConfiguration('editor', doc.uri);
    const tabSize = /** @type {number} */ (cfg.get('tabSize', 4));
    const useSpaces = /** @type {boolean} */ (cfg.get('insertSpaces', true));

    // Stage 1 — protect TT tags from beautify
    const { substituted, stored } = protectTT(text);

    // Stage 2 — HTML formatting (TT placeholders are treated as inert text)
    const htmlFormatted = beautify.html(substituted, {
        indent_size:            tabSize,
        indent_char:            useSpaces ? ' ' : '\t',
        max_preserve_newlines:  1,
        preserve_newlines:      true,
        wrap_line_length:       0,
        end_with_newline:       true,
        extra_liners:           [],
        wrap_attributes:        'auto',
        unformatted:            [],
    });

    // Stage 3 — restore TT tags
    const restored = restoreTT(htmlFormatted, stored);

    // Stage 4 — add TT block indentation on top of HTML indentation
    return applyTTIndentation(restored, indentStr);
}

/**
 * Create a document formatting edit provider
 * @returns {vscode.DocumentFormattingEditProvider}
 */
function createDocumentFormattingEditProvider() {
    return {
        provideDocumentFormattingEdits(document) {
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );
            return [vscode.TextEdit.replace(fullRange, formatText(document.getText(), document))];
        },
    };
}

/**
 * Create a document range formatting edit provider
 * @returns {vscode.DocumentRangeFormattingEditProvider}
 */
function createDocumentRangeFormattingEditProvider() {
    return {
        provideDocumentRangeFormattingEdits(document, range) {
            const expanded = new vscode.Range(
                new vscode.Position(range.start.line, 0),
                new vscode.Position(range.end.line, document.lineAt(range.end.line).text.length)
            );
            const selected = document.getText(expanded);
            return [vscode.TextEdit.replace(expanded, formatText(selected, document))];
        },
    };
}

module.exports = {
    formatText,
    formatHTMLPlusTT,
    isPureTTData,
    getIndentString,
    protectTT,
    restoreTT,
    applyTTIndentation,
    createDocumentFormattingEditProvider,
    createDocumentRangeFormattingEditProvider,
    TT_OPEN_KW,
    TT_MID_KW,
    TT_CLOSE_KW,
};