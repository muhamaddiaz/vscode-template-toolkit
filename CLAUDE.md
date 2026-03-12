# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a VS Code extension that provides syntax highlighting and snippets for Perl Template Toolkit (TT2 and TT3). It is a declarative extension with no build step - it consists of TextMate grammar files (.tmLanguage) and a snippets JSON file.

## Development Workflow

### Testing the Extension

To test the extension locally:

```bash
# Open the project in VS Code, then press F5 to launch the Extension Development Host
# Or use the VS Code CLI:
code --extensionDevelopmentPath=${PWD}
```

The launch configuration is in `.vscode/launch.json`. This opens a new VS Code window with the extension loaded.

### Packaging and Publishing

This extension uses the standard VS Code extension publishing workflow:

```bash
# Install vsce if not already installed
npm install -g @vscode/vsce

# Package the extension (creates .vsix file)
vsce package

# Publish to VS Code Marketplace
vsce publish
```

## Project Structure

```
├── package.json              # Extension manifest - defines languages, grammars, snippets
├── language-configuration.json   # Language configuration (brackets, auto-closing pairs)
├── snippets/
│   └── snippets.json         # Code snippets for TT directives (BLOCK, IF, FOREACH, etc.)
└── syntaxes/
    ├── TT2.tmLanguage        # TT2 grammar (standalone)
    ├── TT3.tmLanguage        # TT3 grammar (standalone)
    ├── HTML+TT2.tmLanguage   # HTML with embedded TT2
    └── HTML+TT3.tmLanguage   # HTML with embedded TT3
```

## Key Configuration Details

### Language Registration

The extension registers the `tt` language in `package.json` with these file extensions:
- `.tt`
- `.tt3`
- `.html.tt`

### HTML Autocomplete Support

The extension enables Emmet HTML expansion for `.tt` files via `configurationDefaults`:

```json
"emmet.includeLanguages": {
    "tt": "html"
}
```

This provides HTML tag completion and Emmet abbreviations in TT files. Note: Full HTML IntelliSense (attribute suggestions, etc.) requires VS Code's HTML language server, which only works when the file is explicitly associated with HTML. The extension provides syntax highlighting and Emmet support but cannot provide full HTML language features without the user configuring file associations.

### Grammar Scope Names

- `source.tt3` - TT3 standalone
- `source.tt2` - TT2 standalone
- `text.html.tt3` - HTML with TT3
- `text.html.tt2` - HTML with TT2

### Snippet Prefixes

The snippets use short prefixes for quick access:
- `block` - BLOCK/END
- `for` - FOREACH
- `if` / `ifelse` / `ifelsif` / `ifs` - IF variations
- `inc` / `inca` - INCLUDE
- `proc` / `proca` - PROCESS
- `set` - SET
- `wrap` / `wrapa` - WRAPPER
- `def` - DEFAULT
- `get` - GET
- `call` - CALL
- `ins` - INSERT
- `macro` - MACRO
- `switch` - SWITCH
- `use` - USE
- `end` - END

## Editing TextMate Grammars

The `.tmLanguage` files are XML plist format. Key patterns for TT syntax:

- Tags are delimited by `[%` and `%]` (with optional modifiers `-`, `+`, `=`, `~`)
- Comments use `[%# ... %]` or `[# ... #]`
- The grammars define `begin`/`end` patterns for tags and include `syntax` and `commands` repositories for directive highlighting

When modifying grammars:
1. Test changes in the Extension Development Host (F5)
2. Changes to `.tmLanguage` files are picked up immediately on window reload
3. Use the "Developer: Inspect Editor Tokens and Scopes" command in VS Code to debug token scopes

## Common Issues

### HTML autocomplete not working

If HTML autocomplete isn't working after installing the extension:
1. Ensure Emmet is enabled: check that `emmet.includeLanguages` has `"tt": "html"`
2. Reload the VS Code window after installing/updating the extension
3. For full HTML IntelliSense, users may need to manually associate `.tt` files with HTML in their settings (though this will override TT syntax highlighting)
