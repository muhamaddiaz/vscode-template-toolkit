/**
 * Template Toolkit Document Formatter
 *
 * Handles formatting for .tt files with two modes:
 * 1. TT Data Structures: Perl-style hashes/arrays (delegates to tt-data-formatter)
 * 2. HTML+TT: HTML with embedded Template Toolkit directives
 *
 * @module formatter
 */

const vscode = require('vscode');
const beautify = require('js-beautify');
const { formatTTDataStructure, isTTDataStructure } = require('./tt-data-formatter');

// =============================================================================
// Constants - TT Directive Categories
// =============================================================================

/**
 * Directives that open a block (increase indentation after)
 */
const BLOCK_OPEN_DIRECTIVES = new Set([
    'IF', 'UNLESS', 'FOREACH', 'FOR', 'WHILE', 'SWITCH', 'TRY',
    'BLOCK', 'WRAPPER', 'FILTER', 'MACRO'
]);

/**
 * Directives in the middle of a block (deindent before, indent after)
 */
const BLOCK_MID_DIRECTIVES = new Set([
    'ELSE', 'ELSIF', 'CASE', 'CATCH', 'FINAL'
]);

/**
 * Directives that close a block (deindent before)
 */
const BLOCK_CLOSE_DIRECTIVES = new Set(['END']);

/**
 * TT tag pattern for detection
 */
const TT_TAG_PATTERN = /\[%[-+~=]?[\s\S]*?[-+~]?%\]/g;

/**
 * TT directive pattern for indentation tracking
 */
const TT_DIRECTIVE_PATTERN = /\[%[-+~=]?\s*([A-Z]+)/gi;

// =============================================================================
// Editor Configuration
// =============================================================================

/**
 * Get indentation settings from VS Code editor configuration
 *
 * @param {vscode.TextDocument} doc - The document being formatted
 * @returns {{ indentSize: number, useSpaces: boolean, indentStr: string }}
 */
function getEditorConfig(doc) {
    const cfg = vscode.workspace.getConfiguration('editor', doc.uri);
    const indentSize = /** @type {number} */ (cfg.get('tabSize', 4));
    const useSpaces = /** @type {boolean} */ (cfg.get('insertSpaces', true));
    const indentStr = useSpaces ? ' '.repeat(indentSize) : '\t';

    return { indentSize, useSpaces, indentStr };
}

/**
 * Get just the indentation string
 *
 * @param {vscode.TextDocument} doc - The document being formatted
 * @returns {string} - Indentation string (spaces or tab)
 */
function getIndentString(doc) {
    return getEditorConfig(doc).indentStr;
}

// =============================================================================
// TT Tag Protection (for HTML formatting)
// =============================================================================

/**
 * Placeholder format for protected TT tags
 */
const PLACEHOLDER_PREFIX = '[__TT';
const PLACEHOLDER_SUFFIX = '__]';

/**
 * Protect TT tags by replacing them with placeholders
 *
 * This prevents js-beautify from corrupting TT syntax during HTML formatting.
 *
 * @param {string} text - Document text
 * @returns {{ substituted: string, stored: string[] }}
 */
function protectTTTags(text) {
    const stored = [];
    const substituted = text.replace(TT_TAG_PATTERN, (match) => {
        const id = stored.length;
        stored.push(match);
        return `${PLACEHOLDER_PREFIX}${id}${PLACEHOLDER_SUFFIX}`;
    });
    return { substituted, stored };
}

/**
 * Restore TT tags from placeholders
 *
 * @param {string} text - Text with placeholders
 * @param {string[]} stored - Original TT tags
 * @returns {string} - Text with restored TT tags
 */
function restoreTTTags(text, stored) {
    const placeholderPattern = new RegExp(
        escapeRegex(PLACEHOLDER_PREFIX) + '(\\d+)' + escapeRegex(PLACEHOLDER_SUFFIX),
        'g'
    );
    return text.replace(placeholderPattern, (_, id) => stored[+id]);
}

/**
 * Escape special regex characters
 */
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Keep old function names for backwards compatibility
const protectTT = protectTTTags;
const restoreTT = restoreTTTags;

// =============================================================================
// TT Block Indentation
// =============================================================================

/**
 * Count TT directive types in a line
 *
 * @param {string} line - Line to analyze
 * @returns {{ openCount: number, midCount: number, closeCount: number }}
 */
function countDirectives(line) {
    let openCount = 0;
    let midCount = 0;
    let closeCount = 0;

    let match;
    const regex = new RegExp(TT_DIRECTIVE_PATTERN.source, 'gi');

    while ((match = regex.exec(line)) !== null) {
        const directive = match[1].toUpperCase();

        if (BLOCK_OPEN_DIRECTIVES.has(directive)) {
            openCount++;
        }
        if (BLOCK_MID_DIRECTIVES.has(directive)) {
            midCount++;
        }
        if (BLOCK_CLOSE_DIRECTIVES.has(directive)) {
            closeCount++;
        }
    }

    return { openCount, midCount, closeCount };
}

/**
 * Apply TT-specific indentation on top of HTML indentation
 *
 * This handles the additional indentation for TT block directives.
 *
 * @param {string} text - HTML-formatted text with TT tags
 * @param {string} indentStr - Indentation string
 * @returns {string} - Text with proper TT indentation
 */
function applyTTBlockIndentation(text, indentStr) {
    const lines = text.split('\n');
    const result = [];
    let indentLevel = 0;

    for (const line of lines) {
        const trimmed = line.trim();

        // Empty lines pass through
        if (!trimmed) {
            result.push('');
            continue;
        }

        // Get the HTML indentation from js-beautify
        const htmlIndent = line.match(/^(\s*)/)?.[1] ?? '';

        // Count directives that affect indentation
        const { openCount, midCount, closeCount } = countDirectives(trimmed);

        // Calculate indent adjustment:
        // - MID and CLOSE directives deindent BEFORE the line
        // - OPEN and MID directives indent AFTER the line
        const deindentBefore = midCount + closeCount;
        const indentAfter = openCount + midCount;

        // Apply deindent before printing
        const currentIndent = Math.max(0, indentLevel - deindentBefore);

        // Print line with combined indentation
        result.push(htmlIndent + indentStr.repeat(currentIndent) + trimmed);

        // Update indent level for next line
        indentLevel = currentIndent + indentAfter;
    }

    return result.join('\n');
}

// Keep old function name for backwards compatibility
const applyTTIndentation = applyTTBlockIndentation;

// =============================================================================
// Content Detection
// =============================================================================

/**
 * Check if document is a pure TT data structure (no HTML)
 *
 * @param {string} text - Document text
 * @returns {boolean}
 */
function isPureTTData(text) {
    const trimmed = text.trim();

    // Must be wrapped in TT tags
    if (!trimmed.startsWith('[%') || !trimmed.endsWith('%]')) {
        return false;
    }

    return isTTDataStructure(text);
}

// =============================================================================
// HTML+TT Formatter
// =============================================================================

/**
 * Default options for js-beautify HTML formatting
 */
function getBeautifyOptions(indentSize, useSpaces) {
    return {
        indent_size: indentSize,
        indent_char: useSpaces ? ' ' : '\t',
        max_preserve_newlines: 1,
        preserve_newlines: true,
        wrap_line_length: 0,
        end_with_newline: true,
        extra_liners: [],
        wrap_attributes: 'auto',
        unformatted: [],
    };
}

/**
 * Format HTML+TT content using the 4-stage pipeline:
 *
 * 1. Protect - Replace TT tags with placeholders
 * 2. Format - Apply js-beautify HTML formatting
 * 3. Restore - Replace placeholders with original TT tags
 * 4. Indent - Apply additional TT block indentation
 *
 * @param {string} text - Document text
 * @param {vscode.TextDocument} doc - Document being formatted
 * @param {string} indentStr - Indentation string
 * @returns {string} - Formatted text
 */
function formatHTMLPlusTT(text, doc, indentStr) {
    const { indentSize, useSpaces } = getEditorConfig(doc);

    // Stage 1: Protect TT tags from beautify
    const { substituted, stored } = protectTTTags(text);

    // Stage 2: HTML formatting
    const htmlFormatted = beautify.html(substituted, getBeautifyOptions(indentSize, useSpaces));

    // Stage 3: Restore TT tags
    const restored = restoreTTTags(htmlFormatted, stored);

    // Stage 4: Apply TT block indentation
    return applyTTBlockIndentation(restored, indentStr);
}

// =============================================================================
// Main Entry Point
// =============================================================================

/**
 * Format TT document text
 *
 * Automatically detects content type and routes to appropriate formatter:
 * - TT data structures → tt-data-formatter
 * - HTML+TT → HTML formatter pipeline
 *
 * @param {string} text - Document text
 * @param {vscode.TextDocument} doc - Document being formatted
 * @returns {string} - Formatted text
 */
function formatText(text, doc) {
    const indentStr = getIndentString(doc);

    // Route to appropriate formatter based on content type
    if (isPureTTData(text)) {
        return formatTTDataStructure(text, indentStr);
    }

    return formatHTMLPlusTT(text, doc, indentStr);
}

// =============================================================================
// VS Code Provider Factories
// =============================================================================

/**
 * Create a document formatting edit provider
 *
 * @returns {vscode.DocumentFormattingEditProvider}
 */
function createDocumentFormattingEditProvider() {
    return {
        provideDocumentFormattingEdits(document) {
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(document.getText().length)
            );
            return [
                vscode.TextEdit.replace(fullRange, formatText(document.getText(), document))
            ];
        },
    };
}

/**
 * Create a document range formatting edit provider
 *
 * Expands selection to full lines for correct indentation.
 *
 * @returns {vscode.DocumentRangeFormattingEditProvider}
 */
function createDocumentRangeFormattingEditProvider() {
    return {
        provideDocumentRangeFormattingEdits(document, range) {
            // Expand to full lines
            const expandedRange = new vscode.Range(
                new vscode.Position(range.start.line, 0),
                new vscode.Position(range.end.line, document.lineAt(range.end.line).text.length)
            );
            const selectedText = document.getText(expandedRange);
            return [
                vscode.TextEdit.replace(expandedRange, formatText(selectedText, document))
            ];
        },
    };
}

// =============================================================================
// Exports
// =============================================================================

module.exports = {
    // Main API
    formatText,
    formatHTMLPlusTT,
    isPureTTData,

    // Configuration
    getIndentString,
    getEditorConfig,

    // TT Tag handling
    protectTT,
    restoreTT,
    protectTTTags,
    restoreTTTags,

    // Indentation
    applyTTIndentation,
    applyTTBlockIndentation,
    countDirectives,

    // Provider factories
    createDocumentFormattingEditProvider,
    createDocumentRangeFormattingEditProvider,

    // Constants (for testing)
    BLOCK_OPEN_DIRECTIVES,
    BLOCK_MID_DIRECTIVES,
    BLOCK_CLOSE_DIRECTIVES,
};