/**
 * Template Toolkit Data Structure Formatter
 *
 * Formats Perl-style data structures inside TT tags:
 * - Hashes: { key => value }
 * - Arrays: [ 'item1', 'item2' ]
 * - String concatenation: "str" _ "str"
 *
 * @module tt-data-formatter
 */

// =============================================================================
// Constants
// =============================================================================

const BRACKET_PAIRS = {
    '{': '}',
    '}': '{',
    '[': ']',
    ']': '[',
};

const OPEN_BRACKETS = new Set(['{', '[']);
const CLOSE_BRACKETS = new Set(['}', ']']);

// Token types
const TokenType = {
    IDENT: 'ident',           // Identifiers: foo, bar_baz
    STRING: 'string',         // Strings: 'hello', "world"
    BRACKET: 'bracket',       // Brackets: { } [ ]
    FAT_COMMA: 'fatcomma',    // Fat comma: =>
    COMMA: 'comma',           // Regular comma: ,
    ASSIGN: 'assign',         // Assignment: =
    OPERATOR: 'operator',     // Operators: _ (concatenation)
    COMMENT: 'comment',       // Comments: # ...
};

// =============================================================================
// Detection
// =============================================================================

/**
 * Check if content is a TT data structure (not HTML)
 *
 * @param {string} text - Full text content
 * @returns {boolean} - True if content appears to be TT data structure
 */
function isTTDataStructure(text) {
    // Must be wrapped in TT tags
    if (!/^\s*\[%[\s\S]*?%\]\s*$/.test(text)) {
        return false;
    }

    // Extract inner content
    const inner = text
        .replace(/^\s*\[%[-+~]?\s*/, '')
        .replace(/[-+~]?\s*%\]\s*$/, '');

    // Detect data structure patterns
    const hasDataStructures = /[{\[]/.test(inner) || /=>/.test(inner);
    const hasHTMLTags = /<\w+[^>]*>/.test(inner);

    return hasDataStructures && !hasHTMLTags;
}

// =============================================================================
// Tokenizer
// =============================================================================

/**
 * Create a token object
 *
 * @param {string} type - Token type from TokenType
 * @param {string} value - Token value
 * @returns {{type: string, value: string}}
 */
function createToken(type, value) {
    return { type, value };
}

/**
 * Tokenize TT data content into a stream of tokens
 *
 * @param {string} text - Inner content (without TT tags)
 * @returns {Array<{type: string, value: string}>} - Array of tokens
 */
function tokenize(text) {
    const tokens = [];
    let pos = 0;

    while (pos < text.length) {
        const char = text[pos];
        const nextChar = text[pos + 1];

        // Skip whitespace
        if (isWhitespace(char)) {
            pos++;
            continue;
        }

        // Comments: # ... until end of line
        if (char === '#') {
            tokens.push(readComment(text, pos));
            pos = skipToEndOfLine(text, pos);
            continue;
        }

        // Strings: '...' or "..."
        if (char === '"' || char === "'") {
            const token = readString(text, pos);
            tokens.push(token);
            pos += token.value.length;
            continue;
        }

        // Brackets: { } [ ]
        if (isOpenBracket(char) || isCloseBracket(char)) {
            tokens.push(createToken(TokenType.BRACKET, char));
            pos++;
            continue;
        }

        // Fat comma: =>
        if (char === '=' && nextChar === '>') {
            tokens.push(createToken(TokenType.FAT_COMMA, '=>'));
            pos += 2;
            continue;
        }

        // Regular comma
        if (char === ',') {
            tokens.push(createToken(TokenType.COMMA, ','));
            pos++;
            continue;
        }

        // Assignment: =
        if (char === '=' && nextChar !== '>') {
            tokens.push(createToken(TokenType.ASSIGN, '='));
            pos++;
            continue;
        }

        // Identifiers and operators
        if (isIdentifierChar(char)) {
            const token = readIdentifier(text, pos);
            // Check if it's the concatenation operator _
            if (token.value === '_' && !isIdentifierChar(text[pos + token.value.length])) {
                tokens.push(createToken(TokenType.OPERATOR, '_'));
            } else {
                tokens.push(token);
            }
            pos += token.value.length;
            continue;
        }

        // Skip unknown characters
        pos++;
    }

    return tokens;
}

/**
 * Read a comment from text
 */
function readComment(text, pos) {
    let comment = '';
    let i = pos;
    while (i < text.length && text[i] !== '\n') {
        comment += text[i];
        i++;
    }
    return createToken(TokenType.COMMENT, comment);
}

/**
 * Read a string literal from text
 */
function readString(text, pos) {
    const quote = text[pos];
    let str = quote;
    let i = pos + 1;

    while (i < text.length) {
        // Handle escape sequences
        if (text[i] === '\\' && i + 1 < text.length) {
            str += text[i] + text[i + 1];
            i += 2;
            continue;
        }
        str += text[i];
        // Check for closing quote
        if (text[i] === quote) {
            i++;
            break;
        }
        i++;
    }

    return createToken(TokenType.STRING, str);
}

/**
 * Read an identifier from text
 */
function readIdentifier(text, pos) {
    let ident = '';
    let i = pos;

    while (i < text.length && isIdentifierChar(text[i])) {
        ident += text[i];
        i++;
    }

    return createToken(TokenType.IDENT, ident);
}

/**
 * Skip to end of line and return position after newline
 */
function skipToEndOfLine(text, pos) {
    while (pos < text.length && text[pos] !== '\n') {
        pos++;
    }
    return pos; // Position at newline (will be skipped by whitespace check)
}

/**
 * Check if character is whitespace
 */
function isWhitespace(char) {
    return /\s/.test(char);
}

/**
 * Check if character is valid for identifiers
 */
function isIdentifierChar(char) {
    return /[a-zA-Z0-9_\.]/.test(char);
}

/**
 * Check if character is an opening bracket
 */
function isOpenBracket(char) {
    return OPEN_BRACKETS.has(char);
}

/**
 * Check if character is a closing bracket
 */
function isCloseBracket(char) {
    return CLOSE_BRACKETS.has(char);
}

// =============================================================================
// Bracket Matching
// =============================================================================

/**
 * Find the matching closing bracket for an opening bracket
 *
 * @param {Array} tokens - Token array
 * @param {number} openIdx - Index of opening bracket token
 * @returns {number} - Index of matching closing bracket, or -1 if not found
 */
function findMatchingCloseBracket(tokens, openIdx) {
    const openChar = tokens[openIdx].value;
    const closeChar = BRACKET_PAIRS[openChar];
    let depth = 1;

    for (let i = openIdx + 1; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type !== TokenType.BRACKET) continue;

        if (token.value === openChar) depth++;
        if (token.value === closeChar) depth--;

        if (depth === 0) return i;
    }

    return -1;
}

/**
 * Find the matching opening bracket for a closing bracket
 *
 * @param {Array} tokens - Token array
 * @param {number} closeIdx - Index of closing bracket token
 * @returns {number} - Index of matching opening bracket, or -1 if not found
 */
function findMatchingOpenBracket(tokens, closeIdx) {
    const closeChar = tokens[closeIdx].value;
    const openChar = BRACKET_PAIRS[closeChar];
    let depth = 1;

    for (let i = closeIdx - 1; i >= 0; i--) {
        const token = tokens[i];
        if (token.type !== TokenType.BRACKET) continue;

        if (token.value === closeChar) depth++;
        if (token.value === openChar) depth--;

        if (depth === 0) return i;
    }

    return -1;
}

// =============================================================================
// Formatter
// =============================================================================

/**
 * TT Data Structure Formatter
 *
 * Formats tokenized TT data with proper indentation and line breaks.
 */
class Formatter {
    constructor(indentStr) {
        this.indentStr = indentStr;
        this.lines = [];
        this.currentLine = '';
        this.indentLevel = 0;
        this.hasContent = false;
    }

    /**
     * Add content to the current line
     */
    add(text) {
        if (this.hasContent) {
            this.currentLine += ' ';
        }
        this.currentLine += text;
        this.hasContent = true;
    }

    /**
     * Add content without a preceding space
     */
    addDirect(text) {
        this.currentLine += text;
        this.hasContent = true;
    }

    /**
     * Finish current line and start a new one
     */
    newLine() {
        if (this.hasContent) {
            this.lines.push(this.currentLine);
        }
        this.currentLine = this.indentStr.repeat(this.indentLevel);
        this.hasContent = false;
    }

    /**
     * Increase indentation level
     */
    indent() {
        this.indentLevel++;
    }

    /**
     * Decrease indentation level
     */
    dedent() {
        this.indentLevel = Math.max(0, this.indentLevel - 1);
    }

    /**
     * Set current line to specific indent level
     */
    setIndent(level) {
        this.currentLine = this.indentStr.repeat(level);
        this.hasContent = false;
    }

    /**
     * Get the formatted output
     */
    getOutput() {
        // Flush any remaining content
        if (this.hasContent) {
            this.lines.push(this.currentLine);
        }
        return this.lines.join('\n');
    }

    /**
     * Process a stream of tokens and format them
     */
    format(tokens) {
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            this.processToken(token, tokens, i);
        }
        return this.getOutput();
    }

    /**
     * Process a single token
     */
    processToken(token, tokens, index) {
        switch (token.type) {
            case TokenType.COMMENT:
                this.processComment(token);
                break;
            case TokenType.BRACKET:
                this.processBracket(token, tokens, index);
                break;
            case TokenType.COMMA:
                this.processComma();
                break;
            case TokenType.FAT_COMMA:
                this.add('=>');
                break;
            case TokenType.ASSIGN:
                this.add('=');
                break;
            case TokenType.OPERATOR:
                this.add(token.value);
                break;
            case TokenType.STRING:
            case TokenType.IDENT:
                this.add(token.value);
                break;
        }
    }

    /**
     * Process a comment token
     */
    processComment(token) {
        // Comments always start on a new line
        if (this.hasContent) {
            this.newLine();
        }
        this.add(token.value);
        this.newLine();
    }

    /**
     * Process a bracket token
     */
    processBracket(token, tokens, index) {
        if (isOpenBracket(token.value)) {
            this.processOpenBracket(token, tokens, index);
        } else {
            this.processCloseBracket(token, tokens, index);
        }
    }

    /**
     * Process an opening bracket
     */
    processOpenBracket(token, tokens, index) {
        // Always keep opening bracket inline
        this.add(token.value);
        this.indent();
        this.newLine();
    }

    /**
     * Process a closing bracket
     */
    processCloseBracket(token, tokens, index) {
        // Finish current line if needed
        if (this.hasContent) {
            this.newLine();
        }
        // Decrease indent before adding bracket
        this.dedent();
        this.setIndent(this.indentLevel);
        this.add(token.value);
    }

    /**
     * Process a comma token
     */
    processComma() {
        // Add comma directly (no space before it)
        this.addDirect(',');
        // Start a new line after comma
        this.newLine();
    }
}

// =============================================================================
// Main Entry Point
// =============================================================================

/**
 * Format TT data structure content
 *
 * @param {string} text - Full TT content including [% %] tags
 * @param {string} indentStr - Indentation string (e.g., '  ' or '    ')
 * @returns {string} - Formatted TT content
 */
function formatTTDataStructure(text, indentStr) {
    // Extract leading whitespace before [% tag
    const leadingMatch = text.match(/^(\s*)\[%/);
    const leadingIndent = leadingMatch ? leadingMatch[1] : '';

    // Extract inner content (between [% and %])
    const inner = text
        .replace(/^\s*\[%[-+~]?\s*/, '')
        .replace(/[-+~]?\s*%\]\s*$/, '');

    // Tokenize and format
    const tokens = tokenize(inner);
    const formatter = new Formatter(indentStr);
    const formattedInner = formatter.format(tokens);

    // Reconstruct with TT tags
    return `${leadingIndent}[%\n${formattedInner}\n${leadingIndent}%]`;
}

// =============================================================================
// Exports
// =============================================================================

module.exports = {
    formatTTDataStructure,
    isTTDataStructure,
    tokenize,
    TokenType,
    Formatter,
};