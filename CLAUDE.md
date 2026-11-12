# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`react-expo-in-app-updater` is a small published npm library (scaffolded with `create-react-native-library`, type `legacy-module`, Kotlin + Swift) exposing one function, `checkForUpdate(UpdateFlow.IMMEDIATE | UpdateFlow.FLEXIBLE): Promise<string>`. This is a public open-source repo: README, docs, code comments and commit messages are in **English**.

## Commands

Yarn 3 workspaces (`yarn@3.6.1`, Node per `.nvmrc`); the root is the library, `example/` is a bare React Native app that consumes it.

```bash
yarn                 # install root + example workspace
yarn lint            # eslint (@react-native + prettier: single quotes, es5 trailing commas)
yarn typecheck       # tsc
yarn test            # jest (preset react-native); single test: yarn test path/to/file -t "name"
yarn prepare         # bob build -> lib/ (commonjs, module, typescript)
yarn clean           # remove lib/ and Android/iOS build dirs

yarn example start   # Metro for the example app
yarn example android
yarn example ios     # run `pod install` in example/ios first
yarn turbo run build:android   # what CI runs
yarn turbo run build:ios
```

There are currently no Jest test files; `yarn test` finds nothing. Lefthook runs eslint + tsc on pre-commit and commitlint (Conventional Commits) on commit-msg. Releases go through `yarn release` (release-it: bumps version, tags `v<version>`, publishes to npm, creates GitHub release).

`lib/` is the build output but **is committed to git**; regenerate it with `yarn prepare` when `src/` changes so they stay in sync.

## Architecture

Three thin layers, all on the **legacy bridge** (no TurboModule spec, no `codegenConfig`):

- **JS** — `src/index.tsx`: reads `NativeModules.ReactExpoInAppUpdater` (falls back to a Proxy that throws a linking error), validates the flow value, and forwards the string `'IMMEDIATE'`/`'FLEXIBLE'` to native.
- **Android** — `android/src/main/java/com/reactexpoinappupdater/ReactExpoInAppUpdaterModule.kt` (`ReactContextBaseJavaModule`, registered by `ReactExpoInAppUpdaterPackage`). Uses Google Play Core In-App Updates (`com.google.android.play:app-update`). FLEXIBLE resolves immediately after starting the flow and auto-calls `completeUpdate()` when downloaded; IMMEDIATE holds the promise until `onActivityResult` (request code 1234). Only works for builds installed from Play (e.g. internal testing track), not sideloaded APKs.
- **iOS** — `ios/ReactExpoInAppUpdater.swift`, exported via `RCT_EXTERN_MODULE` in `ios/ReactExpoInAppUpdater.mm` (Swift↔ObjC through the bridging header). There is no native update API on iOS: it queries the iTunes Lookup API by bundle ID (global first, then retrying with the device's region code), compares semantic versions with `CFBundleShortVersionString`, shows a `UIAlertController` (IMMEDIATE = no "Later" button), and opens an `SKStoreProductViewController`. Requires the bundle ID to be published on the App Store.

The method name and argument order must match across `src/index.tsx`, the Kotlin `@ReactMethod`, the `RCT_EXTERN_METHOD` declaration and the Swift `@objc` signature.

## Error contract — treat as public API

Consumers match on rejection **codes and messages**, so rewording a message is a breaking change. Known consumer (Sima / Open Matic) filters Sentry noise on these exact substrings: `App not found in App Store`, `User cancelled the update`, `Immediate update type not allowed`, `Play Store app is either not installed` (Play Core passthrough via `UPDATE_CHECK_FAILED`), `No current activity`. If a message must change, keep the old text as a prefix or coordinate it. On iOS, lookup errors (including the "App not found" NSError) reach JS under code `FETCH_ERROR` with the NSError's description as message.

Keep the README "Error Codes" table in sync with every `reject(...)` call in both native files.

## New Architecture

See `docs/NEW_ARCHITECTURE.md` before touching module registration. Summary: the module runs on the New Architecture only through RN's legacy-module interop; verified to compile and launch on RN 0.88 / Expo SDK 58 but not exercised at runtime there. The documented migration plan (Expo Module or TurboModule) must keep the JS API and every error code/message identical. Dev deps still pin `react-native` 0.76.5.
