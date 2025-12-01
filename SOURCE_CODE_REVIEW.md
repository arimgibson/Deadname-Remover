# Instructions for Firefox Extension Source Code Review

## Prerequisites

### Required Software
- **Node.js**: Version 24
- **Bun**: Version 1.0.0 or higher

### Supported Operating Systems
Any

## Build Instructions

### Step 1: Install Dependencies
```bash
bun install
```

### Step 2: Build and Package the Extension for Firefox
```bash
bun zip:firefox
```

Optionally, you can test the extension by running `bun dev:firefox` to automatically open a Firefox browser using web-ext.

### Step 3: Locate the Built Extension
After successful build, the packaged extension will be located at:
```
.output/deadname-remover-<version>-firefox.zip
```

For example: `.output/deadname-remover-2.0.0-firefox.zip`
