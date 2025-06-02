# Changelog

## v2.2.0

- Added domain allowlist/blocklist feature to control where the extension operates
  - Users can specify domains where the extension should or should not run based on allow or block mode
  - Supports wildcard domains (e.g. *.example.com)
  - Supports specific overrides (e.g. if google.com is blocked, google.com/maps can be allowed)


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
  - Rewritten UI to be more modern, user friendly, and accessible
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
