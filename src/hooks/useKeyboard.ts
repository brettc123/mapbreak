import { useEffect, useState } from 'react';
import { Keyboard } from '@capacitor/keyboard';

export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const isNative = window.Capacitor?.isNative;

  useEffect(() => {
    if (!isNative) return;

    const showSubscription = Keyboard.addListener('keyboardWillShow', (info) => {
      setKeyboardHeight(info.keyboardHeight);
      setIsKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardHeight(0);
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const hideKeyboard = async () => {
    if (!isNative) return;
    await Keyboard.hide();
  };

  return {
    keyboardHeight,
    isKeyboardVisible,
    hideKeyboard,
  };
}