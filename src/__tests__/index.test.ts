const mockCheckForUpdate = jest.fn();

jest.mock('../NativeReactExpoInAppUpdater', () => ({
  __esModule: true,
  default: {
    checkForUpdate: (...args: unknown[]) => mockCheckForUpdate(...args),
  },
}));

import { checkForUpdate, UpdateFlow } from '../index';

describe('checkForUpdate', () => {
  beforeEach(() => {
    mockCheckForUpdate.mockReset();
  });

  it.each([UpdateFlow.IMMEDIATE, UpdateFlow.FLEXIBLE])(
    'forwards %s to the native module',
    async (flow) => {
      mockCheckForUpdate.mockResolvedValue('No update available');

      await expect(checkForUpdate(flow)).resolves.toBe('No update available');
      expect(mockCheckForUpdate).toHaveBeenCalledWith(flow);
    }
  );

  it('passes native rejections through unchanged', async () => {
    const error = Object.assign(new Error('User cancelled the update'), {
      code: 'UPDATE_CANCELLED',
    });
    mockCheckForUpdate.mockRejectedValue(error);

    await expect(checkForUpdate(UpdateFlow.IMMEDIATE)).rejects.toBe(error);
  });

  it('rejects an invalid flow without calling native code', async () => {
    await expect(checkForUpdate('OTHER' as UpdateFlow)).rejects.toThrow(
      'Invalid update flow. Use UpdateFlow.IMMEDIATE or UpdateFlow.FLEXIBLE.'
    );
    expect(mockCheckForUpdate).not.toHaveBeenCalled();
  });
});
