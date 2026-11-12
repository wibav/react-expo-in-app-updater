# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`react-expo-in-app-updater` is a small published npm library (Kotlin + Swift, a codegen TurboModule since 1.0.0) exposing one function, `checkForUpdate(UpdateFlow.IMMEDIATE | UpdateFlow.FLEXIBLE): Promise<string>`. This is a public open-source repo: README, docs, code comments and commit messages are in **English**.

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

Tests live in `src/__tests__/`: JS behaviour with the native module mocked, and `errorContract.test.ts`, which reads the Kotlin and Swift sources and fails if any resolve/reject code or message changes. Lefthook runs eslint + tsc on pre-commit and commitlint (Conventional Commits) on commit-msg. Releases go through `yarn release` (release-it: bumps version, tags `v<version>`, publishes to npm, creates GitHub release).

`lib/` is the build output but **is committed to git**; regenerate it with `yarn prepare` when `src/` changes so they stay in sync.

## Architecture

A **TurboModule** that requires the New Architecture (legacy-arch users stay on `0.3.x`):

- **Spec** — `src/NativeReactExpoInAppUpdater.ts` is the codegen source (`codegenConfig` in `package.json`, spec `ReactExpoInAppUpdaterSpec`). `src/index.tsx` wraps it, validates the flow, and throws a linking error lazily when the module is missing.
- **Android** — `ReactExpoInAppUpdaterModule.kt` extends the generated `NativeReactExpoInAppUpdaterSpec`; `ReactExpoInAppUpdaterPackage` is a `BaseReactPackage` (`ReactModuleInfo` built with positional args because its parameter names differ across RN versions). Uses Google Play Core In-App Updates. FLEXIBLE resolves right after starting the flow and auto-calls `completeUpdate()` when downloaded; IMMEDIATE holds the promise until `onActivityResult` (request code 1234). Only works for builds installed from Play (internal testing track), not sideloaded APKs.
- **iOS** — `ios/ReactExpoInAppUpdater.mm` conforms to the generated spec protocol and forwards to the Swift class `ReactExpoInAppUpdaterImpl` (`ios/ReactExpoInAppUpdater.swift`). No native update API exists on iOS: it queries the iTunes Lookup API by bundle ID (global, then the device's region), compares `CFBundleShortVersionString`, shows a `UIAlertController` (IMMEDIATE has no "Later"), and opens `SKStoreProductViewController`. Requires a bundle ID published on the App Store. The `.h` is kept private in the podspec because it imports C++ headers Swift cannot parse.

The method signature must match across the spec, the Kotlin `override`, the `.mm` method and the Swift `@objc(checkForUpdate:resolve:reject:)`.

## Error contract — treat as public API

Consumers match on rejection **codes and messages**, so rewording a message is a breaking change. Known consumer (Sima / Open Matic) filters Sentry noise on these exact substrings: `App not found in App Store`, `User cancelled the update`, `Immediate update type not allowed`, `Play Store app is either not installed` (Play Core passthrough via `UPDATE_CHECK_FAILED`), `No current activity`. If a message must change, keep the old text as a prefix or coordinate it. On iOS, lookup errors (including the "App not found" NSError) reach JS under code `FETCH_ERROR` with the NSError's description as message.

Keep the README "Error Codes" table in sync with every `reject(...)` call in both native files.

## Verifying native changes

Codegen only runs in a native build, so `yarn test`/`typecheck` don't catch spec/native mismatches. Build the example: `cd example/android && ./gradlew :app:assembleDebug -PreactNativeArchitectures=arm64-v8a`, and `pod install` + `xcodebuild` (or `yarn example ios`) for iOS. If Android fails with "No variants exist" for the library project, delete `example/android/build/generated/autolinking` (stale paths). The example (RN 0.76) crashes at launch on iOS 27 simulators (no UIScene adoption); use an iOS 26 simulator. See `docs/NEW_ARCHITECTURE.md` for what has and hasn't been verified.
