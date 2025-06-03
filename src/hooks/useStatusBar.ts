import { StatusBar, Style } from '@capacitor/status-bar';
import { useTheme } from '../contexts/ThemeContext';
import { useEffect } from 'react';

export function useStatusBar() {
  const { darkMode } = useTheme();
  const isNative = window.Capacitor?.isNative;

  useEffect(() => {
    if (!isNative) return;

    async function updateStatusBar() {
      try {
        await StatusBar.setStyle({ style: darkMode ? Style.Dark : Style.Light });
        await StatusBar.setBackgroundColor({ color: darkMode ? '#1a1a1a' : '#ffffff' });
      } catch (error) {
        console.error('Error updating status bar:', error);
      }
    }

    updateStatusBar();
  }, [darkMode]);

  const hide = async () => {
    if (!isNative) return;
    await StatusBar.hide();
  };

  const show = async () => {
    if (!isNative) return;
    await StatusBar.show();
  };

  return {
    hide,
    show,
  };
}