export declare enum UpdateFlow {
    IMMEDIATE = "IMMEDIATE",
    FLEXIBLE = "FLEXIBLE"
}
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
export declare function checkForUpdate(updateFlow: UpdateFlow): Promise<string>;
//# sourceMappingURL=index.d.ts.map