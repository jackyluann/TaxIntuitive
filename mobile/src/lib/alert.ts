import { Alert as NativeAlert, Platform } from 'react-native';

/** React Native Web does not implement Alert. Keep confirmations functional on web. */
export const Alert: Pick<typeof NativeAlert, 'alert'> = {
  alert(title, message, buttons, options) {
    if (Platform.OS !== 'web') return NativeAlert.alert(title, message, buttons, options);
    if (typeof window === 'undefined') return;
    const text = [title, message].filter(Boolean).join('\n\n');
    const actions = buttons ?? [{ text: 'OK' }];
    if (actions.length <= 1) {
      window.alert(text);
      actions[0]?.onPress?.();
      return;
    }
    const cancel = actions.find((button) => button.style === 'cancel');
    const action = actions.find((button) => button !== cancel);
    if (window.confirm(`${text}\n\n${action?.text ?? 'Continue'}?`)) action?.onPress?.();
    else cancel?.onPress?.();
  },
};
