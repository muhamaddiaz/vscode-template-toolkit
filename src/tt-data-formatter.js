// Template Toolkit Data Structure Formatter
// Handles Perl-style data structures inside TT tags: hashes {}, arrays [], key => value

// Characters that increase/decrease indentation
const OPEN_BRACKETS = new Set(['{', '[']);
const CLOSE_BRACKETS = new Set(['}', ']']);

/**
 * Check if content is a TT data structure (not HTML)
 * @param {string} text
 * @returns {boolean}
 */
function isTTDataStructure(text) {
    const ttContent = text.match(/^\s*\[%[\s\S]*?%\]\s*$/);
    if (!ttContent) return false;

    const inner = text.replace(/^\s*\[%[-+~]?\s*/, '').replace(/[-+~]?\s*%\]\s*$/, '');

    const hasHashOrArray = /[{\[]/.test(inner);
    const hasFatComma = /=>/.test(inner);
    const hasHTMLTags = /<\w+[^>]*>/.test(inner);

    return (hasHashOrArray || hasFatComma) && !hasHTMLTags;
}

/**
 * Tokenize TT data content for formatting
 * @param {string} text
 * @returns {{type: string, value: string}[]}
 */
function tokenize(text) {
    const tokens = [];
    let i = 0;

    while (i < text.length) {
        const char = text[i];
        const nextChar = text[i + 1];

        // Skip whitespace but track newlines
        if (/\s/.test(char)) {
            i++;
            continue;
        }

        // Handle comments
        if (char === '#') {
            let comment = '';
            while (i < text.length && text[i] !== '\n') {
                comment += text[i];
                i++;
            }
            tokens.push({ type: 'comment', value: comment });
            continue;
        }

        // Handle strings
        if (char === '"' || char === "'") {
            let str = char;
            i++;
            while (i < text.length) {
                if (text[i] === '\\' && i + 1 < text.length) {
                    str += text[i] + text[i + 1];
                    i += 2;
                    continue;
                }
                str += text[i];
                if (text[i] === char) {
                    i++;
                    break;
                }
                i++;
            }
            tokens.push({ type: 'string', value: str });
            continue;
        }

        // Handle brackets
        if (OPEN_BRACKETS.has(char) || CLOSE_BRACKETS.has(char)) {
            tokens.push({ type: 'bracket', value: char });
            i++;
            continue;
        }

        // Handle fat comma
        if (char === '=' && nextChar === '>') {
            tokens.push({ type: 'fatcomma', value: '=>' });
            i += 2;
            continue;
        }

        // Handle comma
        if (char === ',') {
            tokens.push({ type: 'comma', value: ',' });
            i++;
            continue;
        }

        // Handle identifiers, keywords, and operators like _
        if (/[a-zA-Z0-9_\.]/.test(char)) {
            let ident = '';
            while (i < text.length && /[a-zA-Z0-9_\.]/.test(text[i])) {
                ident += text[i];
                i++;
            }
            // Check for _ operator (string concatenation in TT)
            if (ident === '_' && !/[a-zA-Z0-9]/.test(text[i])) {
                tokens.push({ type: 'operator', value: '_' });
                continue;
            }
            tokens.push({ type: 'ident', value: ident });
            continue;
        }

        // Handle _ operator when surrounded by spaces
        if (char === '_' && (/\s/.test(text[i - 1]) || i === 0) && /\s/.test(nextChar)) {
            tokens.push({ type: 'operator', value: '_' });
            i++;
            continue;
        }

        // Handle = (assignment)
        if (char === '=') {
            tokens.push({ type: 'assign', value: '=' });
            i++;
            continue;
        }

        // Skip unknown characters
        i++;
    }

    return tokens;
}

/**
 * Find matching closing bracket index
 * @param {{type: string, value: string}[]} tokens
 * @param {number} openIdx
 * @returns {number}
 */
function findMatchingClose(tokens, openIdx) {
    const openChar = tokens[openIdx].value;
    const closeChar = openChar === '{' ? '}' : ']';
    let depth = 1;

    for (let i = openIdx + 1; i < tokens.length; i++) {
        if (tokens[i].type === 'bracket') {
            if (tokens[i].value === openChar) depth++;
            if (tokens[i].value === closeChar) depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

/**
 * Check if a structure is simple (single-line capable)
 * In TT data structures, we always expand for readability.
 * @param {{type: string, value: string}[]} tokens
 * @param {number} openIdx
 * @param {number} closeIdx
 * @returns {boolean}
 */
function isSimpleStructure(tokens, openIdx, closeIdx) {
    // Always expand structures for consistent formatting
    return false;
}

/**
 * Format TT data structure content
 * @param {string} text
 * @param {string} indentStr
 * @returns {string}
 */
function formatTTDataStructure(text, indentStr) {
    // Extract leading whitespace
    const openTagMatch = text.match(/^(\s*)\[%/);
    const leadingIndent = openTagMatch ? openTagMatch[1] : '';

    // Get inner content
    let inner = text
        .replace(/^\s*\[%[-+~]?\s*/, '')
        .replace(/[-+~]?\s*%\]\s*$/, '');

    // Tokenize
    const tokens = tokenize(inner);

    // Build output
    const output = [];
    let currentLine = '';
    let indentLevel = 0;
    let lineHasContent = false;
    let pendingNewline = false;

    /**
     * Start a new line with proper indentation
     */
    function startNewLine() {
        if (currentLine) {
            output.push(currentLine);
        }
        currentLine = indentStr.repeat(indentLevel);
        lineHasContent = false;
    }

    /**
     * Add content to current line
     */
    function addToLine(content) {
        if (lineHasContent) {
            currentLine += ' ';
        }
        currentLine += content;
        lineHasContent = true;
    }

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const nextToken = tokens[i + 1];

        // Comments - always on their own line
        if (token.type === 'comment') {
            if (lineHasContent) {
                startNewLine();
            }
            addToLine(token.value);
            startNewLine();
            continue;
        }

        // Opening brackets
        if (token.type === 'bracket' && OPEN_BRACKETS.has(token.value)) {
            const closingIdx = findMatchingClose(tokens, i);
            const isSimple = isSimpleStructure(tokens, i, closingIdx);

            if (isSimple && closingIdx !== -1) {
                // Keep simple structure on one line
                addToLine(token.value);
            } else {
                // Keep bracket inline, then increase indent
                addToLine(token.value);
                indentLevel++;
                startNewLine();
            }
            continue;
        }

        // Closing brackets
        if (token.type === 'bracket' && CLOSE_BRACKETS.has(token.value)) {
            const matchingOpenIdx = findMatchingClose(tokens, i);
            // Find matching open by reversing the logic
            const openChar = token.value === '}' ? '{' : '[';
            let depth = 1;
            let foundOpenIdx = -1;
            for (let j = i - 1; j >= 0; j--) {
                if (tokens[j].type === 'bracket') {
                    if (tokens[j].value === token.value) depth++;
                    if (tokens[j].value === openChar) depth--;
                    if (depth === 0) {
                        foundOpenIdx = j;
                        break;
                    }
                }
            }

            const isSimple = isSimpleStructure(tokens, foundOpenIdx, i);

            if (isSimple) {
                addToLine(token.value);
            } else {
                // Decrease indent first
                if (lineHasContent) {
                    startNewLine();
                }
                indentLevel = Math.max(0, indentLevel - 1);
                currentLine = indentStr.repeat(indentLevel);
                addToLine(token.value);
                lineHasContent = true;
            }
            continue;
        }

        // Fat comma
        if (token.type === 'fatcomma') {
            addToLine('=>');
            continue;
        }

        // Comma - end of item, start new line
        if (token.type === 'comma') {
            currentLine += ',';
            startNewLine();
            continue;
        }

        // Assignment
        if (token.type === 'assign') {
            addToLine('=');
            continue;
        }

        // Operators (like _ for string concatenation)
        if (token.type === 'operator') {
            addToLine(token.value);
            continue;
        }

        // Strings and identifiers
        if (token.type === 'string' || token.type === 'ident') {
            addToLine(token.value);
            continue;
        }
    }

    // Flush remaining content
    if (lineHasContent) {
        output.push(currentLine);
    }

    // Build result
    const formattedInner = output.join('\n');
    return `${leadingIndent}[%\n${formattedInner}\n${leadingIndent}%]`;
}

module.exports = {
    formatTTDataStructure,
    isTTDataStructure,
    tokenize,
};