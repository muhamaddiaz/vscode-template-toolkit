# Change Log
All notable changes to the "tt3" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## 0.1.0
- **Auto-format** on save and on paste for `.tt` files
- **Format Document** (`Shift+Alt+F`) powered by js-beautify HTML formatter with TT-aware block indentation
- **Format Selection** (`Ctrl+K Ctrl+F`) — format any selected range
- Emmet HTML expansion enabled by default in `.tt` files (`div>p` etc.)
- TT block directives (`IF`, `FOREACH`, `BLOCK`, `WRAPPER`, `ELSE`, `END`, …) now correctly indent their contents
- Added `embeddedLanguages` declaration for HTML+TT grammars (enables CSS/JS language services inside `<style>`/`<script>` blocks)
- Fixed tab-stop skip bug in `if` snippet

## 0.0.5
- Exclude extensions `.html` and` .css`

## 0.0.4
- README fix

## 0.0.2
- repo link

## 0.0.1
- Initial release
