# Template Toolkit for VS Code

Support for [Perl Template Toolkit](http://www.template-toolkit.org/index.html) syntax and snippets in Visual Studio Code.

Converted from [TextMate Template Toolkit Bundle](https://github.com/textmate/perl-template-toolkit.tmbundle)

## Features

### Syntaxes:
- HTML+TT3
- HTML+TT2
- TT3
- TT2

### Snippets:
- BLOCK
- CALL
- DEFAULT
- END
- FOREACH
- GET
- IF ELSE
- IF ELSIF ELSE
- IF ELSIF
- IF
- INCLUDE
- INSERT
- MACRO
- PROCESS
- SET
- SWITCH
- USE
- WRAPPER

## Release Notes

### 0.1.0
- **Auto-format** on save and on paste for `.tt` files
- **Format Document** (`Shift+Alt+F`) powered by js-beautify HTML formatter with TT-aware block indentation
- **Format Selection** (`Ctrl+K Ctrl+F`) — format any selected range
- Emmet HTML expansion enabled by default in `.tt` files (`div>p` etc.)
- TT block directives (`IF`, `FOREACH`, `BLOCK`, `WRAPPER`, `ELSE`, `END`, …) now correctly indent their contents
- Added `embeddedLanguages` declaration for HTML+TT grammars (enables CSS/JS language services inside `<style>`/`<script>` blocks)
- Fixed tab-stop skip bug in `if` snippet

### 0.0.5
- Exclude extensions `.html` and` .css`

### 0.0.4
- README fix

### 0.0.3
- README fix

### 0.0.2
- repo link

### 0.0.1
- Initial release
