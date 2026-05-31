# Testing Beta Versions (& Sideloading)

This guide includes instructions for testing beta versions, including the steps to pack and load the extension into your browser yourself without the Chrome Web Store.

## Overview

One of the more helpful ways the community can support Deadname Remover is by testing beta versions and reporting bugs, performance issues, and other problems that should be addressed before releasing to the rest of the users. Additionally, when the Chrome Web Store is unavailable or blocked, you can keep using the extension by building locally and loading the output folder unpacked.

Note: when you're loading the extension unpacked into your browser without using the Chrome Web Store/Firefox Add-ons, the extension will not automatically receive updates. See [Updating the Extension](#updating-the-extension) for instructions.

Other Note: if you're using Firefox, the extension will be cleared every time you close the browser, and will need to be reloaded again. However, your settings will be persisted. This is a security feature of Firefox; if you are using Firefox Extended Support Release, Developer, or Nightly editions, you can disable these security features. See instructions on Firefox's [Add-on signing in Firefox](https://support.mozilla.org/en-US/kb/add-on-signing-in-firefox) article for more information.

## What You Need

- Current LTS of [Node.js](https://nodejs.org/) or [Bun](https://bun.sh/)
  - If using Node.js, you'll also need npm but this is included with Node.js
- Optional: Git (for cloning the repository)

## Downloading the Code and Installing Dependencies

First, you'll need to get a copy of the code for the extension. You can do this by cloning the repository using Git, or by downloading an archive of the code at a point in time (does not require Git).

Navigate to the directory where you want to download the code and clone the repository:

<details>
<summary>If you're using Git (recommended if tech savvy):</summary>

```bash
git clone https://github.com/arimgibson/Deadname-Remover.git deadname-remover
cd deadname-remover
```

If you want to test the beta version of the extension, checkout the `beta` branch:

```bash
git checkout beta
```

Otherwise, continue to the next step.
</details>

<details>
<summary>If you're using a zip file:</summary>

You'll download the latest copy of the code using your browser, then unzip the archive to a directory on your computer and open a terminal in that directory.

If you want the latest stable, publicly released version of the extension, download the `main` branch:
https://github.com/arimgibson/Deadname-Remover/archive/refs/heads/main.zip

If you're trying to test the beta version of the extension, download the `beta` branch:
https://github.com/arimgibson/Deadname-Remover/archive/refs/heads/beta.zip

Whenever you want to update the extension to the latest version (or latest beta version), you'll need to repeat these steps.
</details>

Then, you'll need to install the dependencies for the extension. Run the following command:
```bash
npm install
```

Or, if you're using Bun, run this instead:
```bash
bun install
```

## Build the Extension

The project uses [WXT](https://wxt.dev/) as a framework. You can build the extension by running the build command for the browser you want to build for.

**Chromium family (Chrome, Edge, Brave, Opera, Vivaldi, etc.)** — Manifest V3:

```bash
npm run build
```

Or, if you're using Bun:
```bash
bun run build
```

The unpacked extension is **`.output/chrome-mv3/`** (this is the folder you load in Developer mode).

**Firefox** — Manifest V2:

```bash
npm run build:firefox
```

Or, if you're using Bun:
```bash
bun run build:firefox
```

The unpacked extension is **`.output/firefox-mv2/`**.

## Loading the Extension in the Browser (Developer Mode)

### Chrome and other Chromium browsers

1. Open the extensions page:
   - **Chrome (works on most Chromium-based browsers):** `chrome://extensions`
   - **Edge:** `edge://extensions`
   - **Brave:** `brave://extensions`
2. Turn **Developer mode** on (toggle in the top right corner of the page).
3. Click **Load unpacked** on the top left of the screen under the Chrome (or your browser's) logo.
4. Choose the **folder** that contains `manifest.json`, which is the folder you built the extension in: `.output/chrome-mv3`

### Firefox

Temporary install (good for local testing; removed when Firefox closes unless you reload it again):

1. Open **`about:debugging`**.
2. Click **This Firefox** (or open `about:debugging#/runtime/this-firefox`).
3. Click **Load Temporary Add-on…**.
4. Select **`manifest.json`** inside **`.output/firefox-mv2`** (after `npm run build:firefox`).

## After Installing

- Use the extension as normal, such as setting your settings in the options page, opening the popup, and ensuring name replacements occur on websites you use.
- If something breaks or feels wrong, open an issue on the [GitHub issue tracker](https://github.com/arimgibson/Deadname-Remover/issues) with the browser and version along with steps to reproduce the issue.

## Updating the Extension

When sideloading the extension via this method, uploads are not automatically applied. You'll need to download the latest version of the extension, then rebuild the extension.

1. Download the latest version of the code

If you're using Git:

Latest stable version of the extension:
```bash
git checkout main && git pull origin main
```

Latest beta version of the extension:
```bash
git checkout beta && git pull origin beta
```

If you downloaded the code as a zip file, repeat the same steps as specified in that step to download the latest version of the code.

2. Reinstall the dependencies in case they've changed (repeat the installation steps from above)
3. Rebuild the extension (repeat the build steps from above)
4. Refresh the extension in your browser

If you're using Chrome or another Chromium browser, visit the extensions page and click the "refresh" button in the extension card.

If you're using Firefox, open the `about:debugging#/runtime/this-firefox` page and click the "Reload" text in the add-on card.

## Optional: Development Mode with Auto-Rebuild

If you are iterating on code locally, WXT can watch files and rebuild for you:

```bash
npm run dev
```

Or, if you're using Bun:
```bash
bun run dev
```

For more information, see [CONTRIBUTING.md](../CONTRIBUTING.md) for more information.
