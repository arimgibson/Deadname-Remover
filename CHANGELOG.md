# Changelog

## v2.3.0

- Fixed persistent performance issues with targeted improvements to text processing
  - Author note: in the future, we'll probably want to add Playwright tests to programmatically benchmark performance so we can objectively test performance improvements. All the improvements added here are subjective from my own testing; most of these performance issues were raised in [#601](https://github.com/arimgibson/Deadname-Remover/issues/601) so I'll be reaching out to participants in that thread to see if anyone is able to help me beta test for ~1 week before releasing to all users.
- Fixed issue where "site" in popup would not reflect the currently open website
- Added button to popup to add/remove the current site to/from the allowlist or blocklist
- Fixed small bug with how messages were passed between the content and background scripts
- Added documentation on how to test beta versions and sideload the extension into your browser
  - [RUNNING_BETA_VERSIONS.md](./docs/RUNNING_BETA_VERSIONS.md)
  - Includes introduction of a new `beta` branch for beta versions to publish to before release via `main`
  - Author note: eventually, we might want to move into a more structured release process utilizing GitHub releases via tags, auto-deploys on push to main (CD), conventional commits, etc. For the time being, these feel a little overkill as I'm the only consistent maintainer and can tackle these manually
- Internal: migrated to TypeScript 6

## v2.2.2

- Fixed other incomplete config migrations also related to adding allowlist/blocklist features
- Migrated to WXT's storage versioning system for config migrations
  - Consolidates migration logic into a single location
  - Prevents future config migration issues (addresses multiple previously reported bugs)

## v2.2.1

- Fixed incomplete config migrations when adding allowlist/blocklist features

## v2.2.0

- Added domain allowlist/blocklist feature to control where the extension operates (thanks [@Aptcoder](https://github.com/Aptcoder)!)
  - Users can specify domains where the extension should or should not run based on allow or block mode (default is allow)
  - Supports wildcard domains (e.g. *.example.com)
  - Supports specific overrides (e.g. if google.com is blocked, google.com/maps can be allowed)
  - Adds color-coded status indicator showing whether name replacement is enabled or disabled on the current site
- Changed extension icon to be more descriptive given the extension's state
  - Has separate icons for the extension being enabled, disabled, and the current site being blocked
- Moved the "Hide Debug Info" setting under an "Advanced Settings" dropdown section to keep settings more organized

## v2.1.0

- Added keyboard shortcut functionality for quickly enabling/disabling the extension
- Added setting to replace plain text email addresses (Note: Email hyperlinks remain unchanged and will use the original address when clicked)
- Added setting to hide debug logs that contain name mapping information (including deadnames) (thanks [@Lenochxd](https://github.com/Lenochxd)!)
- Resolved UI issue causing switches to not show an indicator when focused
- Excluded SVGs from processing to improve performance

## v2.0.4

- Fix issue with duplicate names being allowed in settings due to case sensitive matching instead of case insensitive.

## v2.0.3

- Resolves bug with names not replacing while maintaining performance.

## v2.0.2

- Resolved issue with excessive processing on added DOM nodes, causing slow performance on larger pages.

## v2.0.1

- Resolves bug with recursive name replacement causing browser lag and crashes.

## v2.0.0 🎉

### Added or Changed

- Complete rewrite of the extension using modern technologies/patterns:
  - Improved performance via new name replacement mechanism
  - Simplified replacement logic via cleaner browser-built in functions (such as document.createNodeIterator)
  - Migration to WXT extension framework for easier development and maintenance
  - Removed need for complicated build and task systems
  - Rewrote UI to be more modern, user friendly, and accessible
  - Integrated mutation observer to detect changes to the DOM and update the UI accordingly
  - Re-analyzed which fields are processed to better follow user expectations
  - Ensured full feature parity with the previous version (except for TamperMonkey scripts)
- New features:
  - Ability to add infinite deadnames and chosen names to process
  - Theme support with trans pride and non-binary pride gradient options
    - Name highlighting with pride-colored gradients
  - Syncing settings across devices is now optional in case of privacy concerns
  - Content blocking to prevent flashing of deadnames
  - Support for shadow DOM elements, meaning more websites are supported
  - Metrics to track the performance of the extension, implement easier debugging
- Improved accessibility:
  - Additional support for screen readers by processing ARIA attributes, `alt` tags
  - High contrast theme option
  - Improved keyboard navigation and accessibility in settings pages
- Enhanced developer experience:
  - Focus on leveraging WXT features and packages to improve development speed and quality
  - Less code to maintain
  - Better codebase structure to reduce barriers to entry for new contributors
  - Svelte for UI components to speed up development, allow more flexibility in UI development
  - OnuUI and UnoCSS for styling; modern, consistent, and easy to use
  - Valibot for data validation and type safety
  - Scripts for linting, type checking, building, etc.
- Misc:
  - Added this changelog :)
  - More detailed and improved communication in Privacy Policy
  - Recreated README to be accurate considering all the changes in this version

### Removed

- Entire previous codebase to modernize and improve the extension
- Support for TamperMonkey scripts
  - May be added back in the future if there is a need for it, though likely not used frequently and adds additional maintenance burden
