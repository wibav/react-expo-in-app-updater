"use strict";

import { NativeModules, Platform } from 'react-native';
const LINKING_ERROR = `The package 'react-expo-in-app-updater' doesn't seem to be linked. Make sure: \n\n` + Platform.select({
  ios: "- You have run 'pod install'\n",
  default: ''
}) + '- You rebuilt the app after installing the package\n' + '- You are not using Expo Go\n';
const ExpoInAppUpdater = NativeModules.ReactExpoInAppUpdater ? NativeModules.ReactExpoInAppUpdater : new Proxy({}, {
  get() {
    throw new Error(LINKING_ERROR);
  }
});
export let UpdateFlow = /*#__PURE__*/function (UpdateFlow) {
  UpdateFlow["IMMEDIATE"] = "IMMEDIATE";
  UpdateFlow["FLEXIBLE"] = "FLEXIBLE";
  return UpdateFlow;
}({});

/**
 * Check for app updates and prompt the user to update.
 * 
 * **Android**: Uses Google Play In-App Updates API
 * - IMMEDIATE: Blocks the app until update is completed
 * - FLEXIBLE: Shows update dialog, allows user to continue using the app
 * 
 * **iOS**: Uses App Store modal and iTunes Lookup API
 * - IMMEDIATE: Shows non-cancelable alert, opens App Store modal
 * - FLEXIBLE: Shows alert with "Update Now" and "Later" options
 * 
 * @param updateFlow - The type of update flow (IMMEDIATE or FLEXIBLE)
 * @returns Promise that resolves with a status message or rejects with an error
 * 
 * @example
 * ```typescript
 * import { checkForUpdate, UpdateFlow } from 'react-expo-in-app-updater';
 * 
 * // Flexible update - user can dismiss
 * checkForUpdate(UpdateFlow.FLEXIBLE)
 *   .then(result => console.log(result))
 *   .catch(error => console.error(error));
 * 
 * // Immediate update - blocks app usage
 * checkForUpdate(UpdateFlow.IMMEDIATE)
 *   .then(result => console.log(result))
 *   .catch(error => console.error(error));
 * ```
 */
export function checkForUpdate(updateFlow) {
  if (![UpdateFlow.IMMEDIATE, UpdateFlow.FLEXIBLE].includes(updateFlow)) {
    return Promise.reject(new Error('Invalid update flow. Use UpdateFlow.IMMEDIATE or UpdateFlow.FLEXIBLE.'));
  }
  return ExpoInAppUpdater.checkForUpdate(updateFlow);
}
//# sourceMappingURL=index.js.map