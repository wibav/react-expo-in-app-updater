jest.mock('../NativeReactExpoInAppUpdater', () => ({
  __esModule: true,
  default: null,
}));

import { checkForUpdate, UpdateFlow } from '../index';

it('throws the linking error when the native module is missing', () => {
  expect(() => checkForUpdate(UpdateFlow.FLEXIBLE)).toThrow(
    "The package 'react-expo-in-app-updater' doesn't seem to be linked."
  );
});
