// @ts-check
'use strict';

const vscode = require('vscode');
const beautify = require('js-beautify');

const TT_OPEN_KW  = new Set(['IF','UNLESS','FOREACH','FOR','WHILE','SWITCH','TRY','BLOCK','WRAPPER','FILTER','MACRO']);
const TT_MID_KW   = new Set(['ELSE','ELSIF','CASE','CATCH','FINAL']);
const TT_CLOSE_KW = new Set(['END']);

/** @param {vscode.TextDocument} doc */
function getIndentString(doc) {
    const cfg = vscode.workspace.getConfiguration('editor', doc.uri);
    const size  = /** @type {number}  */ (cfg.get('tabSize', 4));
    const spaces = /** @type {boolean} */ (cfg.get('insertSpaces', true));
    return spaces ? ' '.repeat(size) : '\t';
}

/**
 * @param {string} text
 * @returns {{ substituted: string, stored: string[] }}
 */
function protectTT(text) {
    /**
     * @type {string[]}
     */
    const stored = [];
    const substituted = text.replace(/\[%[-+~=]?[\s\S]*?[-+~]?%\]/g, match => {
        const id = stored.length;
        stored.push(match);
        return `[__TT${id}__]`;
    });
    return { substituted, stored };
}

/**
 * @param {string} text
 * @param {string[]} stored
 */
function restoreTT(text, stored) {
    return text.replace(/\[__TT(\d+)__\]/g, (_, id) => stored[+id]);
}

/**
 * @param {string} text
 * @param {string} indentStr
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
 * Full 4-stage formatting pipeline for .tt files.
 * @param {string} text
 * @param {vscode.TextDocument} doc
 */
function formatText(text, doc) {
    const indentStr  = getIndentString(doc);
    const cfg        = vscode.workspace.getConfiguration('editor', doc.uri);
    const tabSize    = /** @type {number}  */ (cfg.get('tabSize', 4));
    const useSpaces  = /** @type {boolean} */ (cfg.get('insertSpaces', true));

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

// ── Extension entry points ───────────────────────────────────────────────────

/** @param {vscode.ExtensionContext} context */
function activate(context) {
    const selector = [{ language: 'tt' }];

    // Format entire document
    context.subscriptions.push(
        vscode.languages.registerDocumentFormattingEditProvider(selector, {
            provideDocumentFormattingEdits(document) {
                const fullRange = new vscode.Range(
                    document.positionAt(0),
                    document.positionAt(document.getText().length)
                );
                return [vscode.TextEdit.replace(fullRange, formatText(document.getText(), document))];
            },
        })
    );

    // Format selection (expands to full lines for correct indentation)
    context.subscriptions.push(
        vscode.languages.registerDocumentRangeFormattingEditProvider(selector, {
            provideDocumentRangeFormattingEdits(document, range) {
                const expanded = new vscode.Range(
                    new vscode.Position(range.start.line, 0),
                    new vscode.Position(range.end.line, document.lineAt(range.end.line).text.length)
                );
                const selected = document.getText(expanded);
                return [vscode.TextEdit.replace(expanded, formatText(selected, document))];
            },
        })
    );
}

function deactivate() {}
module.exports = { activate, deactivate };
