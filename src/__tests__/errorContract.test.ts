/**
 * Consumers match on the codes and messages this module resolves and rejects
 * with (see docs/NEW_ARCHITECTURE.md, "Error contract"). These tests fail if a
 * native file stops producing one of them, so a rewording is a deliberate,
 * visible change rather than an accident.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const root = join(__dirname, '..', '..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

const kotlin = read(
  'android/src/main/java/com/reactexpoinappupdater/ReactExpoInAppUpdaterModule.kt'
);
const swift = read('ios/ReactExpoInAppUpdater.swift');

describe('Android error contract', () => {
  it.each([
    'promise.reject("NO_ACTIVITY", "No current activity")',
    `promise.reject("INVALID_TYPE", "Update type must be 'FLEXIBLE' or 'IMMEDIATE'")`,
    'promise.reject("NOT_ALLOWED", "Flexible update type not allowed")',
    'promise.reject("NOT_ALLOWED", "Immediate update type not allowed")',
    'it.reject("UPDATE_CANCELLED", "User cancelled the update")',
    'promise.reject("UPDATE_CHECK_FAILED", e.localizedMessage, e)',
    'promise.resolve("No update available")',
    'promise.resolve("Flexible update started")',
    'it.resolve("Update flow finished")',
  ])('%s', (snippet) => {
    expect(kotlin).toContain(snippet);
  });
});

describe('iOS error contract', () => {
  it.each([
    'reject("NO_BUNDLE_ID", "Could not get bundle identifier", nil)',
    'reject("NO_VERSION", "Could not get current app version", nil)',
    'reject("FETCH_ERROR", error.localizedDescription, error)',
    'reject("NO_DATA", "Could not fetch App Store data", nil)',
    `reject("INVALID_TYPE", "Update type must be 'FLEXIBLE' or 'IMMEDIATE'", nil)`,
    'reject("NO_ROOT_VC", "Could not get root view controller", nil)',
    'reject("STORE_ERROR", error?.localizedDescription ?? "Could not open App Store", error)',
    'NSLocalizedDescriptionKey: "App not found in App Store. Bundle ID: \\(bundleId)"',
    'resolve("No update available" as NSString)',
    'resolve("Update cancelled" as NSString)',
    'resolve("App Store opened" as NSString)',
  ])('%s', (snippet) => {
    expect(swift).toContain(snippet);
  });
});
