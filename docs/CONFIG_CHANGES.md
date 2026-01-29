# Config Versioning Guide

This guide explains how to add new fields to `UserSettings` and how to migrate existing users' configs.

## Overview

Deadname Remover uses WXT's storage versioning to handle user settings, including migrations to ensure existing users' configs don't break when new fields are added. The following steps explain how to add new fields to `UserSettings` and how to migrate existing users' configs.

The most common operation is adding a new field to `UserSettings`, but migrations should be used for any change to the `UserSettings` shape or need to modify existing fields.

## Steps to Add a New Field

### 1. Update version
In `services/configService.ts`, add a new version comment entry including the extension version (matches package.json) that this change is expected to be released in. Also update the `CURRENT_CONFIG_VERSION` to the new config version (these should always be sequential, incrementing by 1).

```typescript
// Version 6: Added exampleField (v2.2.0)
const CURRENT_CONFIG_VERSION = 6
```

### 2. Add version interface
In `utils/types.ts`, add a new version interface that extends the previous version and adds the new field. This allows us to track the types of versions and use them in the migrations. The type should always extend the previous version. If there are no changes to the previous version, still create the type but set it as the previous type (e.g. `export type UserSettingsStorageVersion6 = UserSettingsStorageVersion5`).

```typescript
export interface UserSettingsStorageVersion6 extends UserSettingsStorageVersion5 {
  exampleField: string
}
```

### 3. Add to defaults
In `services/configService.ts`, add the new field to the `defaultSettings` object. The default value should be the default value for the new field.

```typescript
export const defaultSettings: UserSettings = {
  // ...
  exampleField: 'default value',
}
```

### 4. Update Valibot schema
In `utils/types.ts`, add the new field to the `UserSettings` schema:

```typescript
export const UserSettings = v.object({
  // ...
  exampleField: v.string(),
})
```

### 5. Create migration
In `services/configService.ts`, create a new migration function that migrates the previous version to the new version. The function should take a parameter of the previous config version and return the new version of the config.

```typescript
function migrateToV6(config: UserSettingsStorageVersion5): UserSettingsStorageVersion6 {
  return {
    ...config,
    exampleField: defaultSettings.exampleField,
  }
}
```

### 6. Add to both storage items
In `services/configService.ts`, add the new migration function to the `migrations` object for both `localConfigItem` and `syncConfigItem`. The key should be the version number and the value should be the migration function. Make sure both storage items have the same migrations.

```typescript
migrations: {
  //...
  6: migrateToV6,
}
```

## Notes

- Migrations run automatically when config is loaded and before it's used
- See existing migrations in `services/configService.ts` for examples
- Reference: [WXT's storage plugin documentation](https://wxt.dev/storage)
