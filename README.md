# react-expo-in-app-updater

**react-expo-in-app-updater** is a lightweight and easy-to-use library for implementing in-app updates for both **Android** and **iOS**. Keep your app users up-to-date seamlessly with minimal effort.

## Features
- 📦 Lightweight and easy to integrate
- 🤖 **Android**: Google Play In-App Updates API
- 🍎 **iOS**: App Store modal with iTunes Lookup API
- 🔄 Flexible and Immediate update flows
- ⚡ Simple API with TypeScript support
- 🎯 Cross-platform compatibility

## Installation

Install the package using npm or yarn:

```sh
npm install react-expo-in-app-updater
# or
yarn add react-expo-in-app-updater
```

### iOS Setup

Run pod install:
```sh
cd ios && pod install
```

## Usage

### Basic Example

```javascript
import { useEffect } from 'react';
import { checkForUpdate, UpdateFlow } from 'react-expo-in-app-updater';

useEffect(() => {
  checkUpdateAvailability();
}, []);

async function checkUpdateAvailability() {
  try {
    const result = await checkForUpdate(UpdateFlow.FLEXIBLE);
    console.log(result); // "No update available" or "Update started"
  } catch (error) {
    console.error('Update check failed:', error);
  }
}
```

### Update Flow Options

You can choose between two update flows:

#### **Flexible Update**
Allows users to continue using the app while being notified about the update.

```javascript
await checkForUpdate(UpdateFlow.FLEXIBLE);
```

**Platform Behavior:**
- **Android**: Shows update dialog, downloads in background, user can continue using the app
- **iOS**: Shows alert with "Update Now" and "Later" buttons

#### **Immediate Update**
Forces users to update the app before they can continue using it.

```javascript
await checkForUpdate(UpdateFlow.IMMEDIATE);
```

**Platform Behavior:**
- **Android**: Blocks the app, shows full-screen update flow
- **iOS**: Shows non-cancelable alert, opens App Store modal

### Complete Example with Error Handling

```typescript
import { checkForUpdate, UpdateFlow } from 'react-expo-in-app-updater';
import { Alert, Platform } from 'react-native';

async function handleAppUpdate() {
  try {
    const result = await checkForUpdate(UpdateFlow.FLEXIBLE);
    
    if (result === 'No update available') {
      console.log('App is up to date');
    } else {
      console.log('Update flow started:', result);
    }
  } catch (error: any) {
    // Handle specific errors
    switch (error.code) {
      case 'NO_BUNDLE_ID':
        console.error('Could not get app bundle identifier');
        break;
      case 'NO_VERSION':
        console.error('Could not get app version');
        break;
      case 'FETCH_ERROR':
        console.error('Failed to fetch update info:', error.message);
        break;
      case 'UPDATE_CANCELLED':
        console.log('User cancelled the update');
        break;
      default:
        console.error('Update check failed:', error);
    }
  }
}
```

## Platform-Specific Details

### Android
- Uses [Google Play In-App Updates API](https://developer.android.com/guide/playcore/in-app-updates)
- Requires the app to be published on Google Play Store
- Update availability checked via Play Store
- Supports immediate and flexible update modes

### iOS
- Uses [iTunes Lookup API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/) to check version
- Opens App Store modal using `SKStoreProductViewController`
- Compares current version with App Store version
- Shows native iOS alerts for update prompts
- **Note**: Requires app to be published on App Store for version comparison

## API Reference

### `checkForUpdate(updateFlow: UpdateFlow): Promise<string>`

Checks for available updates and prompts the user accordingly.

**Parameters:**
- `updateFlow`: `UpdateFlow.IMMEDIATE` | `UpdateFlow.FLEXIBLE`

**Returns:**
- `Promise<string>`: Resolves with status message or rejects with error

**Possible responses:**
- `"No update available"`: App is up to date
- `"Update started"`: Update flow initiated (Android)
- `"App Store opened"`: App Store modal opened (iOS)
- `"Update cancelled"`: User declined update (Flexible mode only)

### `UpdateFlow` Enum

```typescript
enum UpdateFlow {
  IMMEDIATE = 'IMMEDIATE',  // Forces update
  FLEXIBLE = 'FLEXIBLE'     // Optional update
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `NO_BUNDLE_ID` | Could not get app bundle identifier (iOS) |
| `NO_VERSION` | Could not get current app version (iOS) |
| `NO_ACTIVITY` | No current activity available (Android) |
| `FETCH_ERROR` | Failed to fetch update information |
| `UPDATE_CANCELLED` | User cancelled the update |
| `INVALID_TYPE` | Invalid update flow type provided |
| `NOT_ALLOWED` | Update type not allowed (Android) |

## Troubleshooting

### iOS
- Make sure your app is published on the App Store
- Check that your bundle identifier matches the one in App Store Connect
- Verify that `CFBundleShortVersionString` is set correctly in Info.plist

### Android
- Ensure your app is published on Google Play Store
- In-app updates only work with apps downloaded from Play Store
- Test using internal testing track or production

## Best Practices

1. **Check for updates on app launch**: Place the update check in your app's entry point
2. **Use Flexible for optional updates**: Let users choose when to update
3. **Use Immediate for critical updates**: Force updates for security patches or breaking changes
4. **Handle errors gracefully**: Always wrap in try-catch and provide user feedback
5. **Test thoroughly**: Test both update flows on each platform before releasing

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with ❤️ for React Native developers

