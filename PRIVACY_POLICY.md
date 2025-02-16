Version 2.0.0

# Personal Data

Deadname Remover has never collected and will never collect any personal data, browsing history, etc. All data submitted by the user (settings) remains on the user's device, unless the setting "Sync Settings Across Devices" is opted into (see Storage Sync API section). All data processing (name replacement) happens locally on the user's device.

Any questions regarding the extension's usage and privacy compliance can be directed to maintainer Ari Gibson at hi@arimgibson.com.

# Third Party

## Storage Sync API (Subprocessors Vary)
If the user opts in via settings (disabled by default), Deadname Remover can use Chrome (Chromium) or WebExtensions Storage Sync API for storing and synchronizing a user's settings across devices. This requires the user to have signed into their browser*. The specific storage of this data and privacy settings depend based on the user's browser (Chrome uses a Google account, Edge uses a Microsoft account, Firefox uses a Firefox account, etc.).

When enabling sync, settings are moved from local storage to browser sync storage. When disabling sync, settings are moved to local storage but remain in sync storage until explicitly deleted. Users can remove their data from browser sync storage at any time using the "Delete Synced Data" button in settings, which will reset all synced devices to default settings.

The extension stores only configuration data, which may include user-provided names for replacement. No browsing history, usage data, or other personal information is ever stored.

Storage limits and retention policies are determined by the browser vendor's sync implementation. Users should refer to their browser's privacy policy for details about how synced extension data is handled.

Defaults to opt out. This can be opted in and out via the settings.

* This doesn't mean just signing into an account (e.g. Google account) in your browser. This is if your browser profile is connected via a cloud-synced account (e.g. a Google account for Chrome). Learn more here.

###### Updated: January 20, 2025 [(see update history)](https://github.com/arimgibosn/Deadname-Remover/commits/main/PRIVACY_POLICY.md)
