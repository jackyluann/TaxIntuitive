import { Alert } from '@/lib/alert';
import { Platform } from 'react-native';

describe('web confirmations', () => {
  const originalOS = Platform.OS;
  beforeEach(() => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'web' });
    Object.defineProperty(globalThis, 'window', { configurable: true, value: { alert: jest.fn(), confirm: jest.fn() } });
  });
  afterEach(() => Object.defineProperty(Platform, 'OS', { configurable: true, value: originalOS }));
  it('does not run a destructive action when cancelled', () => {
    const remove = jest.fn();
    (window.confirm as jest.Mock).mockReturnValue(false);
    Alert.alert('Delete?', 'Permanent', [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', onPress: remove }]);
    expect(remove).not.toHaveBeenCalled();
  });
  it('runs the selected action after confirmation', () => {
    const leave = jest.fn();
    (window.confirm as jest.Mock).mockReturnValue(true);
    Alert.alert('Leave?', undefined, [{ text: 'Stay', style: 'cancel' }, { text: 'Leave', onPress: leave }]);
    expect(leave).toHaveBeenCalledTimes(1);
  });
});
