# New Architecture status and maintenance notes

Notes for maintainers. Last reviewed: 2026-11-09, while upgrading a production
consumer app (Expo SDK 56 → 58, React Native 0.85.3 → 0.88.1).

## TL;DR

- The library is a **legacy bridge module**, not a TurboModule. It works on the
  New Architecture only through React Native's compatibility path for legacy
  modules.
- That path behaves the same on React Native 0.85.3, 0.86.0 and 0.88.1, so
  upgrading a consumer across those versions does not change how this module is
  loaded.
- Long term, the module should be migrated to an **Expo Module** or a
  **TurboModule** (see [Migration plan](#migration-plan)). Legacy bridge support
  is exactly what the ecosystem is retiring.
- Error **messages** are effectively part of the public contract: at least one
  consumer filters on them. Treat changes to them as breaking.

## Current architecture

| Layer   | Implementation                                                       | Type          |
| ------- | -------------------------------------------------------------------- | ------------- |
| JS      | `src/index.tsx` reads `NativeModules.ReactExpoInAppUpdater`           | legacy bridge |
| Android | `ReactExpoInAppUpdaterModule : ReactContextBaseJavaModule`, registered by `ReactExpoInAppUpdaterPackage : ReactPackage` | legacy bridge |
| iOS     | Swift class exposed through `RCT_EXTERN_MODULE` / `RCT_EXTERN_METHOD` in `ios/ReactExpoInAppUpdater.mm` | legacy bridge |

There is no `codegenConfig` in `package.json` and no TurboModule spec, so there
is no codegen output and no type-checked native interface.

## Why it works on the New Architecture

In bridgeless mode, React Native decides how legacy `NativeModules` are served
through the `useTurboModuleInterop` feature flag. Checked against the React
Native sources:

| React Native | `useTurboModuleInterop` default | Override in `RNOSS_Stable_Android` |
| ------------ | ------------------------------- | ---------------------------------- |
| 0.85.3       | `false`                         | none                               |
| 0.86.0       | `false`                         | none                               |
| 0.88.1       | `false`                         | none                               |

The flag only selects *which* path serves legacy modules, not *whether* they are
served. Evidence that the module is reachable with `false`: a production app on
React Native 0.85 reports native errors that only this module's Kotlin and Swift
code can produce (`App not found in App Store`, `User cancelled the update`,
`Immediate update type not allowed`, `No current activity`).

## Verified with Expo SDK 58 / React Native 0.88

Inside the consumer app, on the New Architecture:

- ✅ Android **release** build compiles and the app runs (emulator, API 34).
- ✅ iOS **Release** build compiles and the app runs (simulator, iOS 27).
- ⚠️ **Not exercised at runtime.** That consumer only calls `checkForUpdate`
  when its environment is set to production, and the test builds pointed at a
  QA backend. A build that compiles proves linking, not behaviour.

To actually validate a new React Native version, call `checkForUpdate` from a
build installed through a Play Store internal testing track (Android) and from a
build whose bundle ID is published in the App Store (iOS). The Play In-App
Updates API does not work for sideloaded APKs.

`expo-doctor` reports "No metadata available" for this package: it is not listed
in [React Native Directory](https://reactnative.directory). Adding an entry there
would let consumers see its platform and New Architecture status.

## Error contract

Consumers match on what this module rejects with, so both codes and messages
should be treated as public API.

### Codes and messages currently produced

| Code                  | Message                                       | Source                               |
| --------------------- | --------------------------------------------- | ------------------------------------ |
| `NO_ACTIVITY`         | `No current activity`                         | Android                              |
| `INVALID_TYPE`        | `Update type must be 'FLEXIBLE' or 'IMMEDIATE'` | Android                            |
| `NOT_ALLOWED`         | `Flexible update type not allowed`            | Android                              |
| `NOT_ALLOWED`         | `Immediate update type not allowed`           | Android                              |
| `UPDATE_CANCELLED`    | `User cancelled the update`                   | Android                              |
| `UPDATE_CHECK_FAILED` | Passthrough of the Play Core exception message | Android — **not documented in the README table** |
| `404` (NSError code)  | `App not found in App Store. Bundle ID: …`    | iOS                                  |

`UPDATE_CHECK_FAILED` forwards `e.localizedMessage` from Play Core unchanged. One
message seen in the wild through it is `Play Store app is either not installed or
not the official version`, which is a Play Core string, not one of ours.

### Known consumer that depends on the messages

The Sima / Open Matic app (`src/utils/sentryRuido.js`) suppresses expected
environment conditions before reporting to Sentry, matching these strings:

```
App not found in App Store
User cancelled the update
Immediate update type not allowed
Play Store app is either not installed
No current activity
```

Rewording any of them makes that app start reporting them as errors. Before
changing a message, either keep the old text as a prefix or coordinate the
change. The robust fix lives on the consumer side: match on `error.code`, which
is stable, instead of on the message.

## Migration plan

Recommended order, smallest risk first:

1. **Document `UPDATE_CHECK_FAILED`** in the README error table.
2. **Bump `devDependencies.react-native`** from `0.76.5` to a current version and
   make sure the `example/` app builds on the New Architecture.
3. **Migrate the native module**, keeping the JS API (`checkForUpdate`,
   `UpdateFlow`) and every error code identical:
   - **Option A — Expo Module** (`expo-modules-core`): the natural fit given the
     package name and its Expo consumers. Kotlin + Swift, no codegen, works on
     both architectures.
   - **Option B — TurboModule**: add `codegenConfig` to `package.json`, a
     `NativeReactExpoInAppUpdater.ts` spec using
     `TurboModuleRegistry.getEnforcing`, and generated native interfaces.
4. **Add the package to React Native Directory** with its New Architecture status.

Whatever the option, keep a test that asserts the exact code and message for
each rejection path: that is the part consumers rely on.
