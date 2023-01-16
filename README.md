### Expect this README.md to change as the primary maintainer of this repo was updated. Huge thank you to [@WillHayCode](https://github.com/WillHayCode) for her idea, creation, and maintenance of this project (Mar 2018 - June 2022). Credit as well to [@Gusted](https://github.com/Gusted) for Gusted's continued contributions and maintenance.

# Deadname Remover

An easy to use browser plugin to automatically replace dead names with preferred names

Visit [Chrome Web Store](https://chrome.google.com/webstore/detail/deadname-remover/cceilgmnkeijahkehfcgfalepihfbcag/) and [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/deadname-remover/) for more info

If you somehow can't install the extension (due to disabling LGBT-related extension), but can install Greasemonkey/Tampermonkey: you can install it by clicking [here](https://github.com/WillHayCode/Deadname-Remover/raw/main/deadname-remover.user.js)

# Build Instructions

Requires Node LTS or higher

- Open a command shell and navigate to the root directory
- Type `npm install` to install the node devDependencies
- To compile the project type `npm run debug` for debug, and `npm run production` for production-ready files
- The building process will collate a formatted use-able plugin structure into the dist/-folder
- From this folder it can be side-loaded into Firefox or Chromium-based browsers

## Skipping Husky Git Hooks

Deadname Remover uses [Husky](https://typicode.github.io/husky/) git hooks to help the extension automatically conform to certain standards. Utilizing strict linting, styling, and testing practices help keep code uniform across developers while preventing unexpected breaking changes. However, sometimes these hooks with fail but a developer still wants to submit their code. Some reasons could be:

- Unsure how to fix code to conform to standards, and may need push changes so they can ask for help
- A bug in the linting, styling, or testing softwares
- Need to push code quickly without triggering long update and testing scripts

In certain situations including the ones listed above, it might be best to skip git hooks. The following information details how to skip git hooks, taken directly from [Husky's documentation](https://typicode.github.io/husky/#/?id=bypass-hooks):

> You can bypass `pre-commit` and `commit-msg` hooks using Git `-n/--no-verify` option:
>
> ```shell
> git commit -m "yolo!" --no-verify
> ```
>
> For Git commands that don't have a `--no-verify` option, you can use `HUSKY` environment variable:
>
> ```shell
> HUSKY=0 git push # yolo!
> ```
